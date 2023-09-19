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
  MetricData,
} from '@opentelemetry/sdk-metrics';
import {
  ExportResult,
  ExportResultCode,
  VERSION as OT_VERSION,
} from '@opentelemetry/core';
import {ExporterOptions} from './external-types';
import {GoogleAuth, JWT} from 'google-auth-library';
// Import directly from this module instead of googleapis to improve bundler tree shaking
import {monitoring} from 'googleapis/build/src/apis/monitoring';
import type {monitoring_v3} from 'googleapis';
import {transformMetricDescriptor, createTimeSeries} from './transform';
import {MetricDescriptor, TimeSeries} from './types';
import {mountProjectIdPath, partitionList} from './utils';
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

/**
 * Format and sends metrics information to Google Cloud Monitoring.
 */
export class MetricExporter implements PushMetricExporter {
  private _projectId: string | void | Promise<string | void>;
  private readonly _metricPrefix: string;
  private readonly _auth: GoogleAuth;
  private readonly skipMetricDescriptorCheck: boolean;

  static readonly DEFAULT_METRIC_PREFIX: string = 'workload.googleapis.com';

  /**
   * Set of OTel metric names that have already had their metric descriptors successfully
   * created
   */
  private createdMetricDescriptors: Set<string> = new Set();

  private _monitoring: monitoring_v3.Monitoring;

  constructor(options: ExporterOptions = {}) {
    this._metricPrefix = options.prefix ?? MetricExporter.DEFAULT_METRIC_PREFIX;
    this.skipMetricDescriptorCheck = !!options.skipDescriptorCheck;

    this._auth = new GoogleAuth({
      credentials: options.credentials,
      keyFile: options.keyFile,
      keyFilename: options.keyFilename,
      projectId: options.projectId,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    this._monitoring = monitoring({
      version: 'v3',
      rootUrl:
        'https://' + (options.apiEndpoint || 'monitoring.googleapis.com:443'),
      headers: OT_REQUEST_HEADER,
      userAgentDirectives: OT_USER_AGENTS,
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
      resourceMetrics.resource
    );
    const timeSeries: TimeSeries[] = [];
    for (const scopeMetric of resourceMetrics.scopeMetrics) {
      for (const metric of scopeMetric.metrics) {
        const isRegistered =
          this.skipMetricDescriptorCheck ||
          (await this._registerMetricDescriptor(metric));
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
   * registered. Returns false otherwise and should be skipped.
   *
   * @param metric The OpenTelemetry MetricData.
   */
  private async _registerMetricDescriptor(
    metric: MetricData
  ): Promise<boolean> {
    const isDescriptorCreated = this.createdMetricDescriptors.has(
      metric.descriptor.name
    );

    if (isDescriptorCreated) {
      return true;
    }

    const res = await this._createMetricDescriptorIfNeeded(metric);
    if (res) {
      this.createdMetricDescriptors.add(metric.descriptor.name);
      return true;
    }
    return false;
  }

  /**
   * Returns true if a descriptor already exists within the requested GCP project id;
   * @param descriptor The metric descriptor to check
   * @param projectIdPath The GCP project id path
   * @param authClient The authenticated client which will be used to make the request
   * @returns {boolean}
   */
  private async _checkIfDescriptorExists(
    descriptor: MetricDescriptor,
    projectIdPath: string,
    authClient: JWT
  ) {
    try {
      await this._monitoring.projects.metricDescriptors.get({
        name: `${projectIdPath}/metricDescriptors/${descriptor.type}`,
        auth: authClient,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calls CreateMetricDescriptor in the GCM API for the given InstrumentDescriptor if needed
   * @param metric The OpenTelemetry MetricData.
   * @returns whether or not the descriptor was successfully created
   */
  private async _createMetricDescriptorIfNeeded(
    metric: MetricData
  ): Promise<boolean> {
    const authClient = await this._authorize();
    const descriptor = transformMetricDescriptor(metric, this._metricPrefix);
    const projectIdPath = mountProjectIdPath(this._projectId as string);

    try {
      const descriptorExists = await this._checkIfDescriptorExists(
        descriptor,
        projectIdPath,
        authClient
      );
      if (!descriptorExists) {
        await this._monitoring.projects.metricDescriptors.create({
          name: projectIdPath,
          requestBody: descriptor,
          auth: authClient,
        });
        diag.debug('sent metric descriptor', descriptor);
      }
      return true;
    } catch (e) {
      const err = asError(e);
      diag.error('Failed to create metric descriptor: %s', err.message);
      return false;
    }
  }

  private async _sendTimeSeries(timeSeries: TimeSeries[]) {
    if (timeSeries.length === 0) {
      return Promise.resolve();
    }

    const authClient = await this._authorize();
    await this._monitoring.projects.timeSeries.create({
      name: mountProjectIdPath(this._projectId as string),
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
