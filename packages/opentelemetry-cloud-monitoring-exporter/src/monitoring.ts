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
  MetricExporter as IMetricExporter,
  MetricRecord,
  MetricDescriptor as OTMetricDescriptor,
} from '@opentelemetry/metrics';
import {
  ExportResult,
  ExportResultCode,
  NoopLogger,
  VERSION,
} from '@opentelemetry/core';
import {Logger} from '@opentelemetry/api';
import {ExporterOptions} from './external-types';
import {GoogleAuth, JWT} from 'google-auth-library';
import {google} from 'googleapis';
import {transformMetricDescriptor, createTimeSeries} from './transform';
import {TimeSeries} from './types';
import {partitionList} from './utils';

// Stackdriver Monitoring v3 only accepts up to 200 TimeSeries per
// CreateTimeSeries call.
const MAX_BATCH_EXPORT_SIZE = 200;

const OT_USER_AGENT = {
  product: 'opentelemetry-js',
  version: VERSION,
};
const OT_REQUEST_HEADER = {
  'x-opentelemetry-outgoing-request': 0x1,
};
google.options({headers: OT_REQUEST_HEADER});

/**
 * Format and sends metrics information to Google Cloud Monitoring.
 */
export class MetricExporter implements IMetricExporter {
  private _projectId: string | void | Promise<string | void>;
  private readonly _metricPrefix: string;
  private readonly _displayNamePrefix: string;
  private readonly _logger: Logger;
  private readonly _auth: GoogleAuth;
  private readonly _startTime = new Date().toISOString();

  static readonly DEFAULT_DISPLAY_NAME_PREFIX: string = 'OpenTelemetry';
  static readonly CUSTOM_OPENTELEMETRY_DOMAIN: string =
    'custom.googleapis.com/opentelemetry';

  private registeredMetricDescriptors: Map<
    string,
    OTMetricDescriptor
  > = new Map();

  private static readonly _monitoring = google.monitoring('v3');

  constructor(options: ExporterOptions = {}) {
    this._logger = options.logger || new NoopLogger();
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

    // Start this async process as early as possible. It will be
    // awaited on the first export because constructors are synchronous
    this._projectId = this._auth.getProjectId().catch(err => {
      this._logger.error(err);
    });
  }

  /**
   * Saves the current values of all exported {@link MetricRecord}s so that
   * they can be pulled by the Google Cloud Monitoring backend.
   *
   * @param metrics Metrics to be sent to the Google Cloud Monitoring backend
   * @param cb result callback to be called on finish
   */
  async export(
    metrics: MetricRecord[],
    cb: (result: ExportResult) => void
  ): Promise<void> {
    if (this._projectId instanceof Promise) {
      this._projectId = await this._projectId;
    }

    if (!this._projectId) {
      const error = new Error('expecting a non-blank ProjectID');
      this._logger.error(error.message);
      return cb({code: ExportResultCode.FAILED, error});
    }

    this._logger.debug('Google Cloud Monitoring export');
    const timeSeries: TimeSeries[] = [];
    for (const metric of metrics) {
      const isRegistered = await this._registerMetricDescriptor(
        metric.descriptor
      );
      if (isRegistered) {
        timeSeries.push(
          createTimeSeries(
            metric,
            this._metricPrefix,
            this._startTime,
            this._projectId
          )
        );
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
      } catch (err) {
        err.message = `Send TimeSeries failed: ${err.message}`;
        failure = {sendFailed: true, error: err};
        this._logger.error(err.message);
      }
    }
    if (failure.sendFailed) {
      return cb({code: ExportResultCode.FAILED, error: failure.error});
    }
    cb({code: ExportResultCode.SUCCESS});
  }

  async shutdown(): Promise<void> {}

  /**
   * Returns true if the given metricDescriptor is successfully registered to
   * Google Cloud Monitoring, or the exact same metric has already been
   * registered. Returns false otherwise.
   * @param metricDescriptor The OpenTelemetry MetricDescriptor.
   */
  private async _registerMetricDescriptor(
    metricDescriptor: OTMetricDescriptor
  ) {
    const existingMetricDescriptor = this.registeredMetricDescriptors.get(
      metricDescriptor.name
    );

    if (existingMetricDescriptor) {
      if (existingMetricDescriptor === metricDescriptor) {
        // Ignore metricDescriptor that are already registered.
        return true;
      } else {
        this._logger.warn(
          `A different metric with the same name is already registered: ${existingMetricDescriptor}`
        );
        return false;
      }
    }
    const isRegistered = await this._createMetricDescriptor(metricDescriptor)
      .then(() => {
        this.registeredMetricDescriptors.set(
          metricDescriptor.name,
          metricDescriptor
        );
        return true;
      })
      .catch(err => {
        this._logger.error(err);
        return false;
      });
    return isRegistered;
  }

  /**
   * Creates a new metric descriptor.
   * @param metricDescriptor The OpenTelemetry MetricDescriptor.
   */
  private async _createMetricDescriptor(metricDescriptor: OTMetricDescriptor) {
    const authClient = await this._authorize();
    const request = {
      name: `projects/${this._projectId}`,
      resource: transformMetricDescriptor(
        metricDescriptor,
        this._metricPrefix,
        this._displayNamePrefix
      ),
      auth: authClient,
    };
    try {
      return new Promise((resolve, reject) => {
        MetricExporter._monitoring.projects.metricDescriptors.create(
          request,
          {headers: OT_REQUEST_HEADER, userAgentDirectives: [OT_USER_AGENT]},
          (err: Error | null) => {
            this._logger.debug('sent metric descriptor', request.resource);
            err ? reject(err) : resolve();
          }
        );
      });
    } catch (err) {
      this._logger.error(
        `MetricExporter: Failed to write data: ${err.message}`
      );
    }
  }

  private async _sendTimeSeries(timeSeries: TimeSeries[]) {
    if (timeSeries.length === 0) {
      return Promise.resolve();
    }

    return this._authorize().then(authClient => {
      const request = {
        name: `projects/${this._projectId}`,
        resource: {timeSeries},
        auth: authClient,
      };

      return new Promise((resolve, reject) => {
        MetricExporter._monitoring.projects.timeSeries.create(
          request,
          {headers: OT_REQUEST_HEADER, userAgentDirectives: [OT_USER_AGENT]},
          (err: Error | null) => {
            this._logger.debug('sent time series', request.resource.timeSeries);
            err ? reject(err) : resolve();
          }
        );
      });
    });
  }

  /**
   * Gets the Google Application Credentials from the environment variables
   * and authenticates the client.
   */
  private async _authorize(): Promise<JWT> {
    return (await this._auth.getClient()) as JWT;
  }
}
