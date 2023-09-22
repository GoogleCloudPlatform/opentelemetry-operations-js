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

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as assert from 'assert';
import * as nock from 'nock';
import * as sinon from 'sinon';
import {MetricExporter} from '../src';
import {ExportResult, ExportResultCode} from '@opentelemetry/core';
import {emptyResourceMetrics, generateMetricsData} from './util';
import {Attributes} from '@opentelemetry/api';

import type {monitoring_v3} from 'googleapis';
import {describe} from 'mocha';
import {ResourceMetrics} from '@opentelemetry/sdk-metrics';
import {GaxiosPromise} from 'googleapis/build/src/apis/monitoring';

describe('MetricExporter', () => {
  beforeEach(() => {
    process.env.GCLOUD_PROJECT = 'not-real';
    nock.disableNetConnect();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should construct an exporter', () => {
      const exporter = new MetricExporter();
      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');
    });

    it('should be able to shutdown', async () => {
      const exporter = new MetricExporter();
      await assert.doesNotReject(exporter.shutdown());
    });

    it('should construct an exporter', async () => {
      const exporter = new MetricExporter({
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
  });

  describe('export', () => {
    let exporter: MetricExporter;
    let metricDescriptorCreate: sinon.SinonSpy<
      [
        monitoring_v3.Params$Resource$Projects$Metricdescriptors$Create,
        GaxiosPromise<monitoring_v3.Schema$MetricDescriptor>
      ],
      GaxiosPromise<monitoring_v3.Schema$MetricDescriptor>
    >;
    let metricDescriptorsGet: sinon.SinonSpy<
      [
        monitoring_v3.Params$Resource$Projects$Metricdescriptors$Get,
        GaxiosPromise<monitoring_v3.Schema$MetricDescriptor>
      ],
      GaxiosPromise<monitoring_v3.Schema$MetricDescriptor>
    >;
    let timeSeries: sinon.SinonSpy<
      [
        monitoring_v3.Params$Resource$Projects$Timeseries$Create,
        GaxiosPromise<monitoring_v3.Schema$Empty>
      ],
      Promise<monitoring_v3.Schema$Empty>
    >;
    let getClientShouldFail: boolean;
    let createTimeSeriesShouldFail: boolean;
    let createMetricDesriptorShouldFail: boolean;
    let getMetricDesriptorShouldFail: boolean;
    let resourceMetrics: ResourceMetrics;

    beforeEach(async () => {
      getClientShouldFail = false;
      createTimeSeriesShouldFail = false;
      createMetricDesriptorShouldFail = false;
      getMetricDesriptorShouldFail = false;
      exporter = new MetricExporter({});
      resourceMetrics = await generateMetricsData();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      metricDescriptorCreate = sinon.spy(async (request, params) => {
        if (createMetricDesriptorShouldFail) {
          throw new Error('fail');
        }
        return Promise.resolve(
          {} as Partial<
            GaxiosPromise<monitoring_v3.Schema$MetricDescriptor>
          > as GaxiosPromise<monitoring_v3.Schema$MetricDescriptor>
        );
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      metricDescriptorsGet = sinon.spy(async (_request, _params) => {
        if (getMetricDesriptorShouldFail) {
          throw new Error('fail');
        }
        return Promise.resolve(
          {} as Partial<
            GaxiosPromise<monitoring_v3.Schema$MetricDescriptor>
          > as GaxiosPromise<monitoring_v3.Schema$MetricDescriptor>
        );
      });

      sinon.replace(
        exporter['_monitoring'].projects.metricDescriptors,
        'create',
        metricDescriptorCreate as sinon.SinonSpy
      );
      sinon.replace(
        exporter['_monitoring'].projects.metricDescriptors,
        'get',
        metricDescriptorsGet as sinon.SinonSpy
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      timeSeries = sinon.spy(async (req: any, params: any): Promise<any> => {
        if (createTimeSeriesShouldFail) {
          throw new Error('fail');
        }
      });

      sinon.replace(
        exporter['_monitoring'].projects.timeSeries,
        'create',
        timeSeries as any
      );

      sinon.replace(exporter['_auth'], 'getClient', () => {
        if (getClientShouldFail) {
          throw new Error('fail');
        }
        return {} as any;
      });
    });

    it('should return FAILED if project id missing', async () => {
      await exporter['_projectId'];
      exporter['_projectId'] = undefined;

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(emptyResourceMetrics(), result => {
          resolve(result);
        });
      });

      assert.strictEqual(result.code, ExportResultCode.FAILED);
    });

    it('should return FAILED if project id promise is rejected', async () => {
      await exporter['_projectId'];
      exporter['_projectId'] = Promise.reject({
        message: 'Failed to resolve projectId',
      });

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(emptyResourceMetrics(), result => {
          resolve(result);
        });
      });
      assert.deepStrictEqual(result, {
        code: ExportResultCode.FAILED,
        error: {
          message: 'Failed to resolve projectId',
        },
      });
    });

    it('should not raise an UnhandledPromiseRejectionEvent if projectId rejects', async () => {
      const resourceMetrics = await generateMetricsData();
      await exporter['_projectId'];
      exporter['_projectId'] = Promise.reject({
        message: 'Failed to resolve projectId',
      });

      let unhandledPromiseRejectionEvent = false;
      process.on('unhandledRejection', () => {
        unhandledPromiseRejectionEvent = true;
      });

      await new Promise<ExportResult>(resolve => {
        exporter.export(resourceMetrics, result => {
          resolve(result);
        });
      });

      assert.strictEqual(unhandledPromiseRejectionEvent, false);
    });

    it('should call Monitoring.projects.metricDescriptors.get() with the correct data', async () => {
      await new Promise<ExportResult>(resolve => {
        exporter.export(resourceMetrics, result => {
          resolve(result);
        });
      });

      assert.deepStrictEqual(
        metricDescriptorsGet.getCall(0).args[0].name,
        'projects/not-real/metricDescriptors/workload.googleapis.com/name'
      );
    });

    it('should export metrics', async () => {
      const resourceMetrics = await generateMetricsData();
      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(resourceMetrics, result => {
          resolve(result);
        });
      });
      assert.deepStrictEqual(result, {code: ExportResultCode.SUCCESS});
      assert.strictEqual(metricDescriptorCreate.callCount, 0);
      assert.strictEqual(timeSeries.callCount, 1);
    });

    describe('when the metric descriptor was not created yet', () => {
      beforeEach(() => {
        getMetricDesriptorShouldFail = true;
      });

      it('should export metrics', async () => {
        resourceMetrics = await generateMetricsData();
        const result = await new Promise<ExportResult>(resolve => {
          exporter.export(resourceMetrics, result => {
            resolve(result);
          });
        });
        assert.deepStrictEqual(result, {code: ExportResultCode.SUCCESS});
        assert.deepStrictEqual(
          metricDescriptorCreate.getCall(0).args[0].requestBody!.type,
          'workload.googleapis.com/name'
        );
        assert.strictEqual(metricDescriptorCreate.callCount, 1);
        assert.strictEqual(timeSeries.callCount, 1);
      });

      it('should skip metrics when MetricDescriptor creation fails', async () => {
        resourceMetrics = await generateMetricsData();

        createMetricDesriptorShouldFail = true;
        const result = await new Promise<ExportResult>(resolve => {
          exporter.export(resourceMetrics, result => {
            resolve(result);
          });
        });

        assert.strictEqual(metricDescriptorCreate.callCount, 1);
        assert.strictEqual(timeSeries.callCount, 0);
        assert.deepStrictEqual(result.code, ExportResultCode.SUCCESS);
      });

      it('should skip MetricDescriptor creation when a metric has already been seen', async () => {
        resourceMetrics = await generateMetricsData();

        let result = await new Promise<ExportResult>(resolve => {
          exporter.export(resourceMetrics, result => {
            resolve(result);
          });
        });

        assert.strictEqual(metricDescriptorsGet.callCount, 1);
        assert.strictEqual(metricDescriptorCreate.callCount, 1);
        assert.strictEqual(timeSeries.callCount, 1);
        assert.deepStrictEqual(result.code, ExportResultCode.SUCCESS);

        // Second time around, MetricDescriptorCreate.create() should be skipped
        metricDescriptorCreate.resetHistory();
        metricDescriptorsGet.resetHistory();
        timeSeries.resetHistory();
        result = await new Promise<ExportResult>(resolve => {
          exporter.export(resourceMetrics, result => {
            resolve(result);
          });
        });

        assert.strictEqual(metricDescriptorsGet.callCount, 0);
        assert.strictEqual(metricDescriptorCreate.callCount, 0);
        assert.strictEqual(timeSeries.callCount, 1);
        assert.deepStrictEqual(result.code, ExportResultCode.SUCCESS);
      });

      it('should skip fetching the MetricDescriptors when disableCreateMetricDescriptors is set', async () => {
        const exporterSkipDescriptorCreate = new MetricExporter({
          disableCreateMetricDescriptors: true,
        });
        sinon.replace(
          exporterSkipDescriptorCreate['_monitoring'].projects
            .metricDescriptors,
          'create',
          metricDescriptorCreate as sinon.SinonSpy
        );
        sinon.replace(
          exporterSkipDescriptorCreate['_monitoring'].projects
            .metricDescriptors,
          'get',
          metricDescriptorsGet as sinon.SinonSpy
        );
        sinon.replace(
          exporterSkipDescriptorCreate['_monitoring'].projects.timeSeries,
          'create',
          timeSeries as any
        );
        sinon.replace(
          exporterSkipDescriptorCreate['_auth'],
          'getClient',
          () => {
            if (getClientShouldFail) {
              throw new Error('fail');
            }
            return {} as any;
          }
        );

        resourceMetrics = await generateMetricsData();

        const result = await new Promise<ExportResult>(resolve => {
          exporterSkipDescriptorCreate.export(resourceMetrics, result => {
            resolve(result);
          });
        });

        assert.strictEqual(metricDescriptorsGet.callCount, 0);
        assert.strictEqual(metricDescriptorCreate.callCount, 0);
        assert.strictEqual(timeSeries.callCount, 1);
        assert.deepStrictEqual(result.code, ExportResultCode.SUCCESS);
      });

      it('should return FAILED if there is an error sending TimeSeries', async () => {
        resourceMetrics = await generateMetricsData();

        createTimeSeriesShouldFail = true;
        const result = await new Promise<ExportResult>(resolve => {
          exporter.export(resourceMetrics, result => {
            resolve(result);
          });
        });

        assert.deepStrictEqual(
          metricDescriptorCreate.getCall(0).args[0].requestBody!.type,
          'workload.googleapis.com/name'
        );
        assert.strictEqual(metricDescriptorCreate.callCount, 1);
        assert.strictEqual(timeSeries.callCount, 1);
        assert.deepStrictEqual(result.code, ExportResultCode.FAILED);
      });

      it('should handle metrics with no data points with success', async () => {
        resourceMetrics = await generateMetricsData();
        // Clear out metrics array
        resourceMetrics.scopeMetrics[0].metrics[0].dataPoints.length = 0;

        const result = await new Promise<ExportResult>(resolve => {
          exporter.export(resourceMetrics, result => {
            resolve(result);
          });
        });

        // Should still create the metric descriptor
        assert.strictEqual(metricDescriptorCreate.callCount, 1);
        // But no timeseries to write
        assert.strictEqual(timeSeries.callCount, 0);
        assert.deepStrictEqual(result.code, ExportResultCode.SUCCESS);
      });

      it('should enforce batch size limit on metrics', async () => {
        resourceMetrics = await generateMetricsData((_, meter) => {
          const attributes: Attributes = {
            ['keya']: 'value1',
            ['keyb']: 'value2',
          };

          let nMetrics = 401;
          while (nMetrics > 0) {
            nMetrics -= 1;
            const counter = meter.createCounter(`name${nMetrics.toString()}`);
            counter.add(10, attributes);
          }
        });
        const result = await new Promise<ExportResult>(resolve => {
          exporter.export(resourceMetrics, result => {
            resolve(result);
          });
        });

        assert.deepStrictEqual(
          metricDescriptorCreate.getCall(0).args[0].requestBody!.type,
          'workload.googleapis.com/name400'
        );
        assert.deepStrictEqual(
          metricDescriptorCreate.getCall(100).args[0].requestBody!.type,
          'workload.googleapis.com/name300'
        );
        assert.deepStrictEqual(
          metricDescriptorCreate.getCall(400).args[0].requestBody!.type,
          'workload.googleapis.com/name0'
        );

        assert.strictEqual(metricDescriptorCreate.callCount, 401);
        assert.strictEqual(timeSeries.callCount, 3);

        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
      });
    });
  });
});
