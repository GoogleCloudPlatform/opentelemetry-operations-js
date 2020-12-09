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

import * as types from '@opentelemetry/api';
import {TraceFlags} from '@opentelemetry/api';
import {
  ConsoleLogger,
  ExportResult,
  ExportResultCode,
  LogLevel,
} from '@opentelemetry/core';
import {Resource} from '@opentelemetry/resources';
import {ReadableSpan} from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as nock from 'nock';
import * as sinon from 'sinon';
import * as protoloader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import {GoogleAuth, OAuth2Client} from 'google-auth-library';
import {TraceExporter} from '../src';
import {TraceService} from '../src/types';
import {BASE_PATH, HEADER_NAME, HEADER_VALUE, HOST_ADDRESS} from 'gcp-metadata';

const HEADERS: {} = {
  [HEADER_NAME.toLowerCase()]: HEADER_VALUE,
};

const PROJECT_ID_PATH: string = BASE_PATH + '/project/project-id';

describe('Google Cloud Trace Exporter', () => {
  beforeEach(() => {
    process.env.GCLOUD_PROJECT = 'not-real';
    nock.disableNetConnect();
  });
  describe('constructor', () => {
    it('should construct an exporter', async () => {
      const exporter = new TraceExporter({
        credentials: {
          client_email: 'noreply@fake.example.com',
          private_key: 'this is a key',
        },
      });

      assert(exporter);
      return (exporter['_projectId'] as Promise<string>).then(id => {
        assert.deepStrictEqual(id, 'not-real');
      });
    });

    it('should construct exporter in GCE/GCP environment without args', async () => {
      // This variable is set by the test env and must be undefined to force
      // a metadata server request.
      delete process.env.GCLOUD_PROJECT;
      const gcpMock = nock(HOST_ADDRESS)
        .get(PROJECT_ID_PATH)
        .reply(200, () => 'not-real', HEADERS);
      const exporter = new TraceExporter();

      assert(exporter);
      return (exporter['_projectId'] as Promise<string>).then(id => {
        assert.deepStrictEqual(id, 'not-real');
        gcpMock.done();
      });
    });
  });

  describe('export', () => {
    const mockChannelCreds: Partial<grpc.ChannelCredentials> = {
      compose: sinon.stub(),
    };
    const mockCallCreds: Partial<grpc.CallCredentials> = {
      compose: sinon.stub(),
      generateMetadata: sinon.stub(),
    };
    const mockCombinedCreds: Partial<grpc.ChannelCredentials> = {
      compose: sinon.stub(),
    };
    const mockClient: Partial<OAuth2Client> = {
      ...OAuth2Client.prototype,
      ...sinon.mock(OAuth2Client),
    };

    let exporter: TraceExporter;
    let logger: ConsoleLogger;
    let batchWrite: sinon.SinonSpy<
      Parameters<TraceService['BatchWriteSpans']>,
      ReturnType<TraceService['BatchWriteSpans']>
    >;
    let traceServiceConstructor: sinon.SinonSpy;
    let createSsl: sinon.SinonStub;
    let createFromGoogleCreds: sinon.SinonStub;
    let combineChannelCreds: sinon.SinonStub;
    let debug: sinon.SinonSpy;
    let info: sinon.SinonSpy;
    let warn: sinon.SinonSpy;
    let error: sinon.SinonSpy;
    let getClientShouldFail: boolean;
    let batchWriteShouldFail: boolean;

    beforeEach(() => {
      getClientShouldFail = false;
      batchWriteShouldFail = false;
      logger = new ConsoleLogger(LogLevel.ERROR);
      exporter = new TraceExporter({
        logger,
      });

      batchWrite = sinon.spy<TraceService['BatchWriteSpans']>(
        (_spans, _metadata, callback) => {
          if (batchWriteShouldFail) {
            callback(new Error('fail'));
          } else {
            callback(null);
          }
        }
      );

      sinon.replace(exporter['_auth'], 'getClient', async () => {
        if (getClientShouldFail) {
          throw new Error('fail');
        }
        return mockClient as ReturnType<GoogleAuth['getClient']>;
      });

      sinon.stub(protoloader, 'loadSync');

      createSsl = sinon
        .stub(grpc.credentials, 'createSsl')
        .returns(mockChannelCreds as grpc.ChannelCredentials);

      createFromGoogleCreds = sinon
        .stub(grpc.credentials, 'createFromGoogleCredential')
        .returns(mockCallCreds as grpc.CallCredentials);

      combineChannelCreds = sinon
        .stub(grpc.credentials, 'combineChannelCredentials')
        .returns(mockCombinedCreds as grpc.ChannelCredentials);

      sinon.replaceGetter(
        grpc,
        'loadPackageDefinition',
        () => (): grpc.GrpcObject => {
          traceServiceConstructor = sinon.spy(() => {});
          const def = {
            google: {
              devtools: {
                cloudtrace: {
                  v2: {
                    TraceService: {},
                  },
                },
              },
            },
          };
          // Replace the TraceService with a mock TraceService
          def.google.devtools.cloudtrace.v2.TraceService = class MockTraceService
            implements TraceService {
            BatchWriteSpans = batchWrite;
            constructor(host: string, creds: grpc.ChannelCredentials) {
              traceServiceConstructor(host, creds);
            }
          };
          return def;
        }
      );

      debug = sinon.spy();
      info = sinon.spy();
      warn = sinon.spy();
      error = sinon.spy();
      sinon.replace(logger, 'debug', debug);
      sinon.replace(logger, 'info', info);
      sinon.replace(logger, 'warn', warn);
      sinon.replace(logger, 'error', error);
    });

    afterEach(() => {
      nock.restore();
      sinon.restore();
    });

    it('should export spans', async () => {
      const readableSpan: ReadableSpan = {
        attributes: {},
        duration: [32, 800000000],
        startTime: [1566156729, 709],
        endTime: [1566156731, 709],
        ended: true,
        events: [],
        kind: types.SpanKind.CLIENT,
        links: [],
        name: 'my-span',
        spanContext: {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
          isRemote: true,
        },
        status: {code: types.StatusCode.OK},
        resource: Resource.empty(),
        instrumentationLibrary: {name: 'default', version: '0.0.1'},
      };

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export([readableSpan], result => {
          resolve(result);
        });
      });

      assert.deepStrictEqual(
        batchWrite.getCall(0).args[0].spans[0].displayName?.value,
        'my-span'
      );

      assert(createSsl.calledOnceWithExactly());
      assert(createFromGoogleCreds.calledOnceWithExactly(mockClient));
      assert(
        combineChannelCreds.calledOnceWithExactly(
          mockChannelCreds,
          mockCallCreds
        )
      );
      assert(
        traceServiceConstructor.calledOnceWithExactly(
          'cloudtrace.googleapis.com:443',
          mockCombinedCreds
        )
      );
      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
    });

    it('should memoize the rpc client', async () => {
      const readableSpan: ReadableSpan = {
        attributes: {},
        duration: [32, 800000000],
        startTime: [1566156729, 709],
        endTime: [1566156731, 709],
        ended: true,
        events: [],
        kind: types.SpanKind.CLIENT,
        links: [],
        name: 'my-span',
        spanContext: {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
          isRemote: true,
        },
        status: {code: types.StatusCode.OK},
        resource: Resource.empty(),
        instrumentationLibrary: {name: 'default', version: '0.0.1'},
      };

      await new Promise(resolve => {
        exporter.export([readableSpan], result => {
          resolve(result);
        });
      });

      await new Promise(resolve => {
        exporter.export([readableSpan], result => {
          resolve(result);
        });
      });

      assert(createSsl.calledOnce);
      assert(createFromGoogleCreds.calledOnce);
      assert(combineChannelCreds.calledOnce);
      assert(traceServiceConstructor.calledOnce);
    });

    it('should return FAILED if authorization fails', async () => {
      const readableSpan: ReadableSpan = {
        attributes: {},
        duration: [32, 800000000],
        startTime: [1566156729, 709],
        endTime: [1566156731, 709],
        ended: true,
        events: [],
        kind: types.SpanKind.CLIENT,
        links: [],
        name: 'my-span',
        spanContext: {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
          isRemote: true,
        },
        status: {code: types.StatusCode.OK},
        resource: Resource.empty(),
        instrumentationLibrary: {name: 'default', version: '0.0.1'},
      };

      getClientShouldFail = true;

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export([readableSpan], result => {
          resolve(result);
        });
      });
      assert(error.getCall(0).args[0].match(/failed to create client: fail/));
      assert(traceServiceConstructor.calledOnce);
      assert.strictEqual(result.code, ExportResultCode.FAILED);
    });

    it('should return FAILED if span writing fails', async () => {
      const readableSpan: ReadableSpan = {
        attributes: {},
        duration: [32, 800000000],
        startTime: [1566156729, 709],
        endTime: [1566156731, 709],
        ended: true,
        events: [],
        kind: types.SpanKind.CLIENT,
        links: [],
        name: 'my-span',
        spanContext: {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
          isRemote: true,
        },
        status: {code: types.StatusCode.OK},
        resource: Resource.empty(),
        instrumentationLibrary: {name: 'default', version: '0.0.1'},
      };

      batchWriteShouldFail = true;

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export([readableSpan], result => {
          resolve(result);
        });
      });
      assert.strictEqual(result.code, ExportResultCode.FAILED);
    });

    it('should return FAILED if project id missing', async () => {
      const readableSpan: ReadableSpan = {
        attributes: {},
        duration: [32, 800000000],
        startTime: [1566156729, 709],
        endTime: [1566156731, 709],
        ended: true,
        events: [],
        kind: types.SpanKind.CLIENT,
        links: [],
        name: 'my-span',
        spanContext: {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
          isRemote: true,
        },
        status: {code: types.StatusCode.OK},
        resource: Resource.empty(),
        instrumentationLibrary: {name: 'default', version: '0.0.1'},
      };

      await exporter['_projectId'];
      exporter['_projectId'] = undefined;

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export([readableSpan], result => {
          resolve(result);
        });
      });

      assert.strictEqual(result.code, ExportResultCode.FAILED);
    });
  });
});
