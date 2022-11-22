// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  PushMetricExporter,
  ResourceMetrics,
  InstrumentDescriptor,
} from '@opentelemetry/sdk-metrics';
import {
  ExportResult,
  ExportResultCode,
  VERSION as OT_VERSION,
} from '@opentelemetry/core';
import {ExporterOptions} from './external-types';
import {GoogleAuth, JWT} from 'google-auth-library';
import {google, monitoring_v3} from 'googleapis';
import {transformMetricDescriptor, createTimeSeries} from './transform';
import {TimeSeries} from './types';
import {partitionList} from './utils';
import {diag} from '@opentelemetry/api';
import {mapOtelResourceToMonitoredResource} from '@google-cloud/opentelemetry-resource-util';

import {VERSION} from './version';

// Stackdriver Monitoring v3 only accepts up to 200 TimeSeries per
// CreateTimeSeries call.
const MAX_BATCH_EXPORT_SIZE = 200;

const OT_USER_AGENTS = [
  {
    product: 'opentelemetry-js',
    version: OT_VERSION,
  },
  {
    product: 'google-cloud-metric-exporter',
    version: VERSION,
  },
];
const OT_REQUEST_HEADER = {
  'x-opentelemetry-outgoing-request': 0x1,
};
google.options({
  headers: OT_REQUEST_HEADER,
  userAgentDirectives: OT_USER_AGENTS,
});

/**
 * Format and sends metrics information to Google Cloud Monitoring.
 */
export class MetricExporter implements PushMetricExporter {
  private _projectId: string | void | Promise<string | void>;
  private readonly _metricPrefix: string;
  private readonly _displayNamePrefix: string;
  private readonly _auth: GoogleAuth;
  private readonly _startTime = new Date().toISOString();

  static readonly DEFAULT_DISPLAY_NAME_PREFIX: string = 'OpenTelemetry';
  static readonly CUSTOM_OPENTELEMETRY_DOMAIN: string =
    'custom.googleapis.com/opentelemetry';

  private registeredInstrumentDescriptors: Map<string, InstrumentDescriptor> =
    new Map();

  private _monitoring: monitoring_v3.Monitoring;

  constructor(options: ExporterOptions = {}) {
    this._metricPrefix =
      options.prefix || MetricExporter.CUSTOM_OPENTELEMETRY_DOMAIN;
    this._displayNamePrefix =
      options.prefix || MetricExporter.DEFAULT_DISPLAY_NAME_PREFIX;

    this._auth = new GoogleAuth({
      credentials: options.credentials,
      keyFile: options.keyFile,
      keyFilename: options.keyFilename,
      projectId: options.projectId,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    this._monitoring = google.monitoring({
      version: 'v3',
      rootUrl:
        'https://' + (options.apiEndpoint || 'monitoring.googleapis.com:443'),
    });

    // Start this async process as early as possible. It will be
    // awaited on the first export because constructors are synchronous
    this._projectId = this._auth.getProjectId().catch(err => {
      diag.error(err);
    });
  }

  /**
   * Implementation for {@link PushMetricExporter.export}.
   * Calls the async wrapper method {@link _exportAsync} and
   * assures no rejected promises bubble up to the caller.
   *
   * @param metrics Metrics to be sent to the Google Cloud Monitoring backend
   * @param resultCallback result callback to be called on finish
   */
  export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void
  ): void {
    this._exportAsync(metrics).then(resultCallback, err => {
      diag.error(err.message);
      resultCallback({code: ExportResultCode.FAILED, error: err});
    });
  }

  async shutdown(): Promise<void> {}
  async forceFlush(): Promise<void> {}

  /**
   * Asnyc wrapper for the {@link export} implementation.
   * Writes the current values of all exported {@link MetricRecord}s
   * to the Google Cloud Monitoring backend.
   *
   * @param resourceMetrics Metrics to be sent to the Google Cloud Monitoring backend
   */
  private async _exportAsync(
    resourceMetrics: ResourceMetrics
  ): Promise<ExportResult> {
    if (this._projectId instanceof Promise) {
      this._projectId = await this._projectId;
    }

    if (!this._projectId) {
      const error = new Error('expecting a non-blank ProjectID');
      diag.error(error.message);
      return {code: ExportResultCode.FAILED, error};
    }

    diag.debug('Google Cloud Monitoring export');
    const resource = mapOtelResourceToMonitoredResource(
      resourceMetrics.resource,
      this._projectId
    );
    const timeSeries: TimeSeries[] = [];
    for (const scopeMetric of resourceMetrics.scopeMetrics) {
      for (const metric of scopeMetric.metrics) {
        const isRegistered = await this._registerMetricDescriptor(
          metric.descriptor
        );
        if (isRegistered) {
          timeSeries.push(
            ...createTimeSeries(metric, resource, this._metricPrefix)
          );
        }
      }
    }

    let failure: {sendFailed: false} | {sendFailed: true; error: Error} = {
      sendFailed: false,
    };
    for (const batchedTimeSeries of partitionList(
      timeSeries,
      MAX_BATCH_EXPORT_SIZE
    )) {
      try {
        await this._sendTimeSeries(batchedTimeSeries);
      } catch (e) {
        const err = asError(e);
        err.message = `Send TimeSeries failed: ${err.message}`;
        failure = {sendFailed: true, error: err};
        diag.error(err.message);
      }
    }
    if (failure.sendFailed) {
      return {code: ExportResultCode.FAILED, error: failure.error};
    }
    return {code: ExportResultCode.SUCCESS};
  }

  /**
   * Returns true if the given metricDescriptor is successfully registered to
   * Google Cloud Monitoring, or the exact same metric has already been
   * registered. Returns false otherwise.
   * @param instrumentDescriptor The OpenTelemetry MetricDescriptor.
   */
  private async _registerMetricDescriptor(
    instrumentDescriptor: InstrumentDescriptor
  ) {
    const existingInstrumentDescriptor =
      this.registeredInstrumentDescriptors.get(instrumentDescriptor.name);

    if (existingInstrumentDescriptor) {
      if (existingInstrumentDescriptor === instrumentDescriptor) {
        // Ignore descriptors that are already registered.
        return true;
      } else {
        diag.warn(
          'A different metric with the same name is already registered: %s',
          existingInstrumentDescriptor
        );
        return false;
      }
    }

    try {
      await this._createMetricDescriptor(instrumentDescriptor);
      this.registeredInstrumentDescriptors.set(
        instrumentDescriptor.name,
        instrumentDescriptor
      );
      return true;
    } catch (e) {
      const err = asError(e);
      diag.error('Error creating metric descriptor: %s', err.message);
      return false;
    }
  }

  /**
   * Calls CreateMetricDescriptor in the GCM API for the given InstrumentDescriptor
   * @param instrumentDescriptor The OpenTelemetry InstrumentDescriptor.
   */
  private async _createMetricDescriptor(
    instrumentDescriptor: InstrumentDescriptor
  ) {
    const authClient = await this._authorize();
    const descriptor = transformMetricDescriptor(
      instrumentDescriptor,
      this._metricPrefix,
      this._displayNamePrefix
    );
    try {
      await this._monitoring.projects.metricDescriptors.create({
        name: `projects/${this._projectId}`,
        requestBody: descriptor,
        auth: authClient,
      });
      diag.debug('sent metric descriptor', descriptor);
    } catch (e) {
      const err = asError(e);
      diag.error('Failed to create metric descriptor: %s', err.message);
    }
  }

  private async _sendTimeSeries(timeSeries: TimeSeries[]) {
    if (timeSeries.length === 0) {
      return Promise.resolve();
    }

    const authClient = await this._authorize();
    await this._monitoring.projects.timeSeries.create({
      name: `projects/${this._projectId}`,
      requestBody: {timeSeries},
      auth: authClient,
    });
    diag.debug('sent time series', timeSeries);
  }

  /**
   * Gets the Google Application Credentials from the environment variables
   * and authenticates the client.
   */
  private async _authorize(): Promise<JWT> {
    return (await this._auth.getClient()) as JWT;
  }
}

function asError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}
