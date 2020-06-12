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

import { ExportResult } from '@opentelemetry/base';
import { NoopLogger } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter  } from '@opentelemetry/tracing';
import { Logger } from '@opentelemetry/api';
import * as protoloader from '@grpc/proto-loader';
import * as protofiles from 'google-proto-files';
import * as grpc from 'grpc';
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { TraceExporterOptions } from './external-types';
import { getReadableSpanTransformer } from './transform';
import { Span, SpansWithCredentials, TraceService } from './types';

const OT_REQUEST_HEADER = 'x-opentelemetry-outgoing-request';
google.options({ headers: { [OT_REQUEST_HEADER]: 1 } });

/**
 * Format and sends span information to Google Cloud Trace.
 */
export class TraceExporter implements SpanExporter {
  private _projectId: string | void | Promise<string | void>;
  private readonly _logger: Logger;
  private readonly _auth: GoogleAuth;
  private _traceServiceClient?: TraceService = undefined;

  constructor(options: TraceExporterOptions = {}) {
    this._logger = options.logger || new NoopLogger();

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

    const pacakageDefinition = protoloader.loadSync(protofiles.getProtoPath('devtools', 'cloudtrace', 'v2', 'tracing.proto'), {
      includeDirs: [protofiles.getProtoPath('..')],
    });
    const { google }: any = grpc.loadPackageDefinition(pacakageDefinition);
    const traceService = google.devtools.cloudtrace.v2.TraceService;
    this._auth.getApplicationDefault()
      .then((creds) => {
        const sslCreds = grpc.credentials.createSsl();
        const callCreds = grpc.credentials.createFromGoogleCredential(creds.credential);
        this._traceServiceClient = 
          new traceService('cloudtrace.googleapis.com', grpc.credentials.combineChannelCredentials(sslCreds, callCreds));
    })
      .catch(this._logger.error);
    this._traceServiceClient = new traceService('cloudtrace.googleapis.com', grpc.credentials.createInsecure());
  }

  /**
   * Publishes a list of spans to Google Cloud Trace.
   * @param spans The list of spans to transmit to Google Cloud Trace
   */
  async export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): Promise<void> {
    if (this._projectId instanceof Promise) {
      this._projectId = await this._projectId;
    }

    if (!this._projectId) {
      return resultCallback(ExportResult.FAILED_NOT_RETRYABLE);
    }
    
    this._logger.debug('Google Cloud Trace export');
    const authorizedSpans = await this._authorize(spans.map(getReadableSpanTransformer(this._projectId)));

    if (!authorizedSpans) {
      return resultCallback(ExportResult.FAILED_NOT_RETRYABLE);
    }
    this._logger.debug('Google Cloud Trace got span authorization');

    try {
      await this._batchWriteSpans(authorizedSpans);
      resultCallback(ExportResult.SUCCESS);
    } catch (err) {
      this._logger.error(`Google Cloud Trace failed to export ${err}`);
      resultCallback(ExportResult.FAILED_RETRYABLE);
    }
  }

  shutdown(): void {}

  /**
   * Sends new spans to new or existing traces in the Google Cloud Trace format to the
   * service.
   * @param spans
   */
  private _batchWriteSpans(spans: SpansWithCredentials) {
    this._logger.debug('Google Cloud Trace batch writing traces');
    return new Promise((resolve, reject) => {
      if (!this._traceServiceClient) {
        return reject(new Error('channel not yet opened'));
      }
      // TODO: Add headers for authentication
      const call = {
        name: spans.name,
        spans: spans.resource.spans,
      };
      this._traceServiceClient.BatchWriteSpans(call, (err: Error) => {
        if (err) {
          err.message = `batchWriteSpans error: ${err.message}`;
          this._logger.error(err.message);
          reject(err);
        } else {
          const successMsg = 'batchWriteSpans successfully';
          this._logger.debug(successMsg);
          resolve(successMsg);
        }
      });
    });
  }

  /**
   * Gets the Google Application Credentials from the environment variables,
   * authenticates the client and calls a method to send the spans data.
   * @param spans The spans to export
   */
  private async _authorize(
    spans: Span[]
  ): Promise<SpansWithCredentials | null> {
    try {
      return {
        name: `projects/${this._projectId}`,
        resource: { spans },
        auth: await this._auth.getClient(),
      };
    } catch (err) {
      err.message = `authorize error: ${err.message}`;
      this._logger.error(err.message);
      return null;
    }
  }
}
