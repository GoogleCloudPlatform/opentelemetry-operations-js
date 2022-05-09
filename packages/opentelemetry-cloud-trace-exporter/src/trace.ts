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

import {ExportResult, ExportResultCode} from '@opentelemetry/core';
import {ReadableSpan, SpanExporter} from '@opentelemetry/sdk-trace-base';
import {diag} from '@opentelemetry/api';
import * as protoloader from '@grpc/proto-loader';
import * as protofiles from 'google-proto-files';
import * as grpc from '@grpc/grpc-js';
import {GoogleAuth} from 'google-auth-library';
import {promisify} from 'util';
import {TraceExporterOptions} from './external-types';
import {getReadableSpanTransformer} from './transform';
import {TraceService, NamedSpans} from './types';

const OT_REQUEST_HEADER = 'x-opentelemetry-outgoing-request';

/**
 * Format and sends span information to Google Cloud Trace.
 */
export class TraceExporter implements SpanExporter {
  private _projectId: string | void | Promise<string | void>;
  private readonly _auth: GoogleAuth;
  private _traceServiceClient?: TraceService = undefined;
  private _resourceFilter?: RegExp = undefined;
  private _apiEndpoint = 'cloudtrace.googleapis.com:443';

  constructor(options: TraceExporterOptions = {}) {
    this._resourceFilter = options.resourceFilter;
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
      diag.error(err);
    });

    if (options.apiEndpoint) {
      this._apiEndpoint = options.apiEndpoint;
    }
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
      return resultCallback({
        code: ExportResultCode.FAILED,
        error: new Error('Was not able to determine GCP project ID'),
      });
    }

    diag.debug('Google Cloud Trace export');

    const namedSpans: NamedSpans = {
      name: `projects/${this._projectId}`,
      spans: spans.map(
        getReadableSpanTransformer(this._projectId, this._resourceFilter)
      ),
    };

    const result = await this._batchWriteSpans(namedSpans);
    resultCallback(result);
  }

  async shutdown(): Promise<void> {}

  /**
   * Sends new spans to new or existing traces in the Google Cloud Trace format to the
   * service.
   * @param spans
   */
  private async _batchWriteSpans(spans: NamedSpans): Promise<ExportResult> {
    diag.debug('Google Cloud Trace batch writing traces');
    try {
      this._traceServiceClient = await this._getClient();
    } catch (e) {
      const error = asError(e);
      error.message = `failed to create client: ${error.message}`;
      diag.error(error.message);
      return {code: ExportResultCode.FAILED, error};
    }

    const metadata = new grpc.Metadata();
    metadata.add(OT_REQUEST_HEADER, '1');
    const batchWriteSpans = promisify(
      this._traceServiceClient.BatchWriteSpans
    ).bind(this._traceServiceClient);
    try {
      await batchWriteSpans(spans, metadata);
      diag.debug('batchWriteSpans successfully');
      return {code: ExportResultCode.SUCCESS};
    } catch (e) {
      const error = asError(e);
      error.message = `batchWriteSpans error: ${error.message}`;
      diag.error(error.message);
      return {code: ExportResultCode.FAILED, error};
    }
  }

  /**
   * If the rpc client is not already initialized,
   * authenticates with google credentials and initializes the rpc client
   */
  private async _getClient(): Promise<TraceService> {
    if (this._traceServiceClient) {
      return this._traceServiceClient;
    }
    diag.debug('Google Cloud Trace authenticating');
    const creds = await this._auth.getClient();
    diag.debug(
      'Google Cloud Trace got authentication. Initializaing rpc client'
    );
    const packageDefinition = await protoloader.load(
      protofiles.getProtoPath('devtools', 'cloudtrace', 'v2', 'tracing.proto'),
      {
        includeDirs: [protofiles.getProtoPath('..')],
        longs: String,
        defaults: true,
        oneofs: true,
      }
    );
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const {google}: any = grpc.loadPackageDefinition(packageDefinition);
    const traceService = google.devtools.cloudtrace.v2.TraceService;
    const sslCreds = grpc.credentials.createSsl();
    const callCreds = grpc.credentials.createFromGoogleCredential(creds);
    return new traceService(
      this._apiEndpoint,
      grpc.credentials.combineChannelCredentials(sslCreds, callCreds)
    );
  }
}

function asError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}
