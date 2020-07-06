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

import * as assert from 'assert';
import * as nock from 'nock';
import * as sinon from 'sinon';
import { MetricExporter } from '../src';
import { ConsoleLogger, LogLevel } from '@opentelemetry/core';
import { ExportResult } from '@opentelemetry/base';
import { MeterProvider } from '@opentelemetry/metrics';
import { Labels } from '@opentelemetry/api';

describe('MetricExporter', () => {
  beforeEach(() => {
    process.env.GCLOUD_PROJECT = 'not-real';
    nock.disableNetConnect();
  });

  describe('constructor', () => {
    it('should construct an exporter', () => {
      const exporter = new MetricExporter();
      assert.ok(typeof exporter.export === 'function');
      assert.ok(typeof exporter.shutdown === 'function');
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
    let logger: ConsoleLogger;
    /* tslint:disable no-any */
    let metricDescriptors: sinon.SinonSpy<[any, any, any], any>;
    /* tslint:disable no-any */
    let timeSeries: sinon.SinonSpy<[any, any, any], any>;
    let debug: sinon.SinonSpy;
    let info: sinon.SinonSpy;
    let warn: sinon.SinonSpy;
    let error: sinon.SinonSpy;
    let getClientShouldFail: boolean;
    let createTimeSeriesShouldFail: boolean;

    beforeEach(() => {
      getClientShouldFail = false;
      createTimeSeriesShouldFail = false;
      logger = new ConsoleLogger(LogLevel.ERROR);
      exporter = new MetricExporter({
        logger,
      });

      metricDescriptors = sinon.spy(
        /* tslint:disable no-any */
        (
          request: any,
          params: any,
          callback: (err: Error | null) => void
        ): any => {
          callback(null);
        }
      );

      sinon.replace(
        MetricExporter['_monitoring'].projects.metricDescriptors,
        'create',
        /* tslint:disable no-any */
        metricDescriptors as any
      );

      timeSeries = sinon.spy(
        /* tslint:disable no-any */
        (
          request: any,
          params: any,
          callback: (err: Error | null) => void
        ): any => {
          if (createTimeSeriesShouldFail) {
            return callback(new Error('fail'));
          }
          callback(null);
        }
      );

      sinon.replace(
        MetricExporter['_monitoring'].projects.timeSeries,
        'create',
        /* tslint:disable no-any */
        timeSeries as any
      );

      sinon.replace(exporter['_auth'], 'getClient', () => {
        if (getClientShouldFail) {
          throw new Error('fail');
        }
        /* tslint:disable no-any */
        return {} as any;
      });

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

    it('should return not retryable if project id missing', async () => {
      await exporter['_projectId'];
      exporter['_projectId'] = undefined;

      const result = await new Promise((resolve, reject) => {
        exporter.export([], result => {
          resolve(result);
        });
      });

      assert.deepStrictEqual(result, ExportResult.FAILED_NOT_RETRYABLE);
    });

    it('should export metrics', async () => {
      const meter = new MeterProvider().getMeter('test-meter');
      const labels: Labels = { ['keyb']: 'value2', ['keya']: 'value1' };
      const counter = meter.createCounter('name');
      counter.add(10, labels);
      meter.collect();
      const records = meter.getBatcher().checkPointSet();

      const result = await new Promise((resolve, reject) => {
        exporter.export(records, result => {
          resolve(result);
        });
      });
      assert.deepStrictEqual(
        metricDescriptors.getCall(0).args[0].resource.type,
        'custom.googleapis.com/opentelemetry/name'
      );
      assert.equal(metricDescriptors.callCount, 1);
      assert.equal(timeSeries.callCount, 1);
      assert.deepStrictEqual(result, ExportResult.SUCCESS);
    });


    it('should return retryable if there is an error sending TimeSeries', async () => {
      const meter = new MeterProvider().getMeter('test-meter');
      const labels: Labels = { ['keyb']: 'value2', ['keya']: 'value1' };
      const counter = meter.createCounter('name');
      counter.add(10, labels);
      meter.collect();
      const records = meter.getBatcher().checkPointSet();
      createTimeSeriesShouldFail = true;
      const result = await new Promise((resolve, reject) => {
        exporter.export(records, result => {
          resolve(result);
        });
      });
      assert.deepStrictEqual(
        metricDescriptors.getCall(0).args[0].resource.type,
        'custom.googleapis.com/opentelemetry/name'
      );
      assert.equal(metricDescriptors.callCount, 1);
      assert.equal(timeSeries.callCount, 1);
      assert.deepStrictEqual(result, ExportResult.FAILED_RETRYABLE);
    });

    it('should enforce batch size limit on metrics', async () => {
      const meter = new MeterProvider().getMeter('test-meter');

      const labels: Labels = { ['keyb']: 'value2', ['keya']: 'value1' };
      let nMetrics = 401;
      while (nMetrics > 0) {
        nMetrics -= 1;
        const counter = meter.createCounter(`name${nMetrics.toString()}`);
        counter.bind(labels).add(10);
      }
      meter.collect();
      const records = meter.getBatcher().checkPointSet();

      const result = await new Promise((resolve, reject) => {
        exporter.export(records, result => {
          resolve(result);
        });
      });

      assert.deepStrictEqual(
        metricDescriptors.getCall(0).args[0].resource.type,
        'custom.googleapis.com/opentelemetry/name400'
      );
      assert.deepStrictEqual(
        metricDescriptors.getCall(100).args[0].resource.type,
        'custom.googleapis.com/opentelemetry/name300'
      );
      assert.deepStrictEqual(
        metricDescriptors.getCall(400).args[0].resource.type,
        'custom.googleapis.com/opentelemetry/name0'
      );

      assert.equal(metricDescriptors.callCount, 401);
      assert.equal(timeSeries.callCount, 3);

      assert.deepStrictEqual(result, ExportResult.SUCCESS);
    });
  });
});
