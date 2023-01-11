// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Snapshot tests written using https://github.com/bahmutov/snap-shot-it. Snapshots are sorted
 * based on the config option in package.json.
 *
 * To update snapshots, use `npm run update-snapshot-tests`
 */

import {Attributes, ValueType} from '@opentelemetry/api';
import * as snapshot from 'snap-shot-it';
import {ExportResult, ExportResultCode} from '@opentelemetry/core';
import {Aggregation, ResourceMetrics, View} from '@opentelemetry/sdk-metrics';
import * as assert from 'assert';
import * as nock from 'nock';
import * as sinon from 'sinon';
import {MetricExporter} from '../src';
import {generateMetricsData} from './util';

import type {monitoring_v3} from 'googleapis/build/src/apis/monitoring/v3';
import type {AsyncFunc, Func} from 'mocha';

const LABELS: Attributes = {
  string: 'string',
  int: 123,
  float: 123.4,
};

const PROJECT_ID = 'otel-starter-project';

type Body =
  | monitoring_v3.Schema$CreateTimeSeriesRequest
  | monitoring_v3.Schema$MetricDescriptor;

class GcmNock {
  calls: {
    uri: string;
    body: Body;
    userAgent: string;
  }[] = [];

  constructor() {
    const calls = this.calls;
    const replyCallback = function (
      this: nock.ReplyFnContext,
      uri: string,
      body: nock.Body
    ): nock.ReplyBody {
      const userAgent = this.req.headers['user-agent'];
      calls.push({uri, body: body as Body, userAgent});
      return {};
    };

    nock('https://oauth2.googleapis.com:443')
      .persist()
      .post('/token')
      .reply(200, {});
    nock('https://monitoring.googleapis.com')
      .persist()
      .post(/v3\/.+\/metricDescriptors/)
      .reply(200, replyCallback)
      .post(/v3\/projects\/.+\/timeSeries/)
      .reply(200, replyCallback);
  }

  /**
   * Sanitizes recorded calls to GCM API and then asserts the call matches the previously saved
   * snapshot.
   *
   * To update snapshots, use `npm run update-snapshot-tests`
   */
  snapshotCalls() {
    // Remove any dynamic parts of the metrics which can't be snapshot tested
    this.calls.forEach(call => {
      if ('timeSeries' in call.body) {
        call.body.timeSeries?.forEach(ts => {
          ts.points?.forEach(point => {
            // Sanitize start and end times
            if (point.interval?.startTime) {
              point.interval.startTime = 'startTime';
            }
            if (point.interval?.endTime) {
              point.interval.endTime = 'endTime';
            }
          });
        });
      }
    });
    snapshot(this.calls);
  }
}

describe('MetricExporter snapshot tests', () => {
  let gcmNock: GcmNock;

  beforeEach(async () => {
    nock.disableNetConnect();
    gcmNock = new GcmNock();
  });

  afterEach(() => {
    nock.cleanAll();
    sinon.restore();
  });

  [
    {valueType: ValueType.INT, value: 10},
    {valueType: ValueType.DOUBLE, value: 12.3},
  ].forEach(({valueType, value}) => {
    function itParams(title: string, f: Func | AsyncFunc) {
      it(`${title} - ${ValueType[valueType]}`, f);
    }

    itParams('Counter', async () => {
      const resourceMetrics = await generateMetricsData((_, meter) => {
        meter
          .createCounter('mycounter', {
            description: 'counter description',
            unit: '{myunit}',
            valueType,
          })
          .add(value, LABELS);
      });

      const result = await callExporter(resourceMetrics);
      assert.deepStrictEqual(result, {code: ExportResultCode.SUCCESS});
      gcmNock.snapshotCalls();
    });

    itParams('UpDownCounter', async () => {
      const resourceMetrics = await generateMetricsData((_, meter) => {
        meter
          .createUpDownCounter('myupdowncounter', {
            description: 'updowncounter description',
            unit: '{myunit}',
            valueType,
          })
          .add(value, LABELS);
      });

      const result = await callExporter(resourceMetrics);
      assert.deepStrictEqual(result, {code: ExportResultCode.SUCCESS});
      gcmNock.snapshotCalls();
    });

    itParams('Histogram', async () => {
      const resourceMetrics = await generateMetricsData((_, meter) => {
        meter
          .createHistogram('myhistogram', {
            description: 'histogram description',
            unit: '{myunit}',
            valueType,
          })
          .record(value, LABELS);
      });

      const result = await callExporter(resourceMetrics);
      assert.deepStrictEqual(result, {code: ExportResultCode.SUCCESS});
      gcmNock.snapshotCalls();
    });

    itParams('ObservableCounter', async () => {
      const resourceMetrics = await generateMetricsData((_, meter) => {
        meter
          .createObservableCounter('myobservablecounter', {
            description: 'counter description',
            unit: '{myunit}',
            valueType,
          })
          .addCallback(observableResult => {
            observableResult.observe(value, LABELS);
          });
      });

      const result = await callExporter(resourceMetrics);
      assert.deepStrictEqual(result, {code: ExportResultCode.SUCCESS});
      gcmNock.snapshotCalls();
    });

    itParams('ObservableUpDownCounter', async () => {
      const resourceMetrics = await generateMetricsData((_, meter) => {
        meter
          .createObservableUpDownCounter('myobservableupdowncounter', {
            description: 'instrument description',
            unit: '{myunit}',
            valueType,
          })
          .addCallback(observableResult => {
            observableResult.observe(value, LABELS);
          });
      });

      const result = await callExporter(resourceMetrics);
      assert.deepStrictEqual(result, {code: ExportResultCode.SUCCESS});
      gcmNock.snapshotCalls();
    });

    itParams('ObservableGauge', async () => {
      const resourceMetrics = await generateMetricsData((_, meter) => {
        meter
          .createObservableGauge('myobservablegauge', {
            description: 'instrument description',
            unit: '{myunit}',
            valueType,
          })
          .addCallback(observableResult => {
            observableResult.observe(value, LABELS);
          });
      });

      const result = await callExporter(resourceMetrics);
      assert.deepStrictEqual(result, {code: ExportResultCode.SUCCESS});
      gcmNock.snapshotCalls();
    });
  });

  it('normalizes label keys in metric and descriptor', async () => {
    const resourceMetrics = await generateMetricsData((_, meter) => {
      const counter = meter.createCounter('mycounter', {
        description: 'instrument description',
        unit: '{myunit}',
        valueType: ValueType.INT,
      });
      counter.add(1, {
        valid_key_1: 'valid_key_1',
        hellø: 'hellø',
        '123': 'key_123',
        'key!321': 'key_321',
        'hyphens-dots.slashes/': 'hyphens_dots_slashes_',
        'non_letters_:£¢$∞': 'non_letters______',
      });
    });

    const result = await callExporter(resourceMetrics);
    assert.deepStrictEqual(result, {code: ExportResultCode.SUCCESS});
    gcmNock.snapshotCalls();
  });

  describe('reconfigure with views', () => {
    it('counter with histogram view', async () => {
      const resourceMetrics = await generateMetricsData(
        (_, meter) => {
          meter
            .createCounter('mycounter', {
              description: 'instrument description',
              unit: '{myunit}',
              valueType: ValueType.DOUBLE,
            })
            .add(12.3);
        },
        {
          views: [
            new View({
              instrumentName: 'mycounter',
              aggregation: Aggregation.Histogram(),
              name: 'myrenamedhistogram',
            }),
          ],
        }
      );

      const result = await callExporter(resourceMetrics);
      assert.deepStrictEqual(result, {code: ExportResultCode.SUCCESS});
      gcmNock.snapshotCalls();
    });
  });
});

function callExporter(resourceMetrics: ResourceMetrics): Promise<ExportResult> {
  return new Promise(resolve => {
    const exporter = new MetricExporter({
      projectId: PROJECT_ID,
    });
    // Application default credentials won't be available so stub them away
    sinon.stub(exporter['_auth'], 'getClient');
    exporter.export(resourceMetrics, resolve);
  });
}
