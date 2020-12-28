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
import {
  ConsoleLogger,
  ExportResult,
  ExportResultCode,
  LogLevel,
} from '@opentelemetry/core';
import {MeterProvider} from '@opentelemetry/metrics';
import {Labels} from '@opentelemetry/api';

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
    let metricDescriptors: sinon.SinonSpy<[any, any, any], any>;
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
        metricDescriptors as any
      );

      timeSeries = sinon.spy(
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
        timeSeries as any
      );

      sinon.replace(exporter['_auth'], 'getClient', () => {
        if (getClientShouldFail) {
          throw new Error('fail');
        }
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

    it('should return FAILED if project id missing', async () => {
      await exporter['_projectId'];
      exporter['_projectId'] = undefined;

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export([], result => {
          resolve(result);
        });
      });

      assert.strictEqual(result.code, ExportResultCode.FAILED);
    });

    it('should export metrics', async () => {
      const meter = new MeterProvider().getMeter('test-meter');
      const labels: Labels = {['keya']: 'value1', ['keyb']: 'value2'};
      const counter = meter.createCounter('name');
      counter.add(10, labels);
      await meter.collect();
      const records = meter.getProcessor().checkPointSet();

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(records, result => {
          resolve(result);
        });
      });
      assert.deepStrictEqual(
        metricDescriptors.getCall(0).args[0].resource.type,
        'custom.googleapis.com/opentelemetry/name'
      );

      assert.strictEqual(metricDescriptors.callCount, 1);
      assert.strictEqual(timeSeries.callCount, 1);

      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
    });

    it('should return FAILED if there is an error sending TimeSeries', async () => {
      const meter = new MeterProvider().getMeter('test-meter');
      const labels: Labels = {['keya']: 'value1', ['keyb']: 'value2'};
      const counter = meter.createCounter('name');
      counter.add(10, labels);
      await meter.collect();
      const records = meter.getProcessor().checkPointSet();
      createTimeSeriesShouldFail = true;
      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(records, result => {
          resolve(result);
        });
      });
      assert.deepStrictEqual(
        metricDescriptors.getCall(0).args[0].resource.type,
        'custom.googleapis.com/opentelemetry/name'
      );
      assert.strictEqual(metricDescriptors.callCount, 1);
      assert.strictEqual(timeSeries.callCount, 1);
      assert.deepStrictEqual(result.code, ExportResultCode.FAILED);
    });

    it('should enforce batch size limit on metrics', async () => {
      const meter = new MeterProvider().getMeter('test-meter');

      const labels: Labels = {['keya']: 'value1', ['keyb']: 'value2'};
      let nMetrics = 401;
      while (nMetrics > 0) {
        nMetrics -= 1;
        const counter = meter.createCounter(`name${nMetrics.toString()}`);
        counter.bind(labels).add(10);
      }
      await meter.collect();
      const records = meter.getProcessor().checkPointSet();

      const result = await new Promise<ExportResult>(resolve => {
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

      assert.strictEqual(metricDescriptors.callCount, 401);
      assert.strictEqual(timeSeries.callCount, 3);

      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
    });

    it('should use the same startTime for cumulative metrics each export', async () => {
      const meter = new MeterProvider().getMeter('test-meter');
      const labels: Labels = {['keya']: 'value1', ['keyb']: 'value2'};
      const counter = meter.createCounter('name');
      counter.add(10, labels);
      await meter.collect();
      const records1 = meter.getProcessor().checkPointSet();

      await exporter.export(records1, () => {});

      assert(timeSeries.calledOnce);
      const calledWithSeries1 =
        timeSeries.firstCall.args[0].resource.timeSeries;
      assert.strictEqual(calledWithSeries1.length, 1);
      assert.strictEqual(calledWithSeries1[0].points.length, 1);
      const interval1 = calledWithSeries1[0].points[0].interval;
      assert(interval1.startTime);
      assert(interval1.endTime);

      // Export a second time
      counter.add(15, labels);
      await meter.collect();
      const records2 = meter.getProcessor().checkPointSet();

      await exporter.export(records2, () => {});

      assert(timeSeries.calledTwice);
      const calledWithSeries2 =
        timeSeries.secondCall.args[0].resource.timeSeries;
      assert.strictEqual(calledWithSeries2.length, 1);
      assert.strictEqual(calledWithSeries2[0].points.length, 1);
      const interval2 = calledWithSeries2[0].points[0].interval;
      assert(interval1.startTime);
      assert(interval1.endTime);

      assert.strictEqual(interval1.startTime, interval2.startTime);
      assert(interval2.endTime);
    });
  });
});
