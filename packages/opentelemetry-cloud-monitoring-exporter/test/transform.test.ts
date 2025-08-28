// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License"); // you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as sinon from 'sinon';
import * as assert from 'assert';
import {_TEST_ONLY, createTimeSeries} from '../src/transform';
import {
  AggregationTemporality,
  DataPointType,
  ExponentialHistogramMetricData,
  InstrumentType,
  MetricData,
} from '@opentelemetry/sdk-metrics';
import {DiagAPI, ValueType, diag} from '@opentelemetry/api';

const {normalizeLabelKey} = _TEST_ONLY;

describe('transform', () => {
  let diagSpy: sinon.SinonSpiedInstance<DiagAPI>;

  beforeEach(() => {
    diagSpy = sinon.spy(diag);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('normalizeLabelKeys', () => {
    it('normalizes label keys', () => {
      [
        ['valid_key_1', 'valid_key_1'],
        ['hellø', 'hellø'],
        ['123', 'key_123'],
        ['key!321', 'key_321'],
        ['hyphens-dots.slashes/', 'hyphens_dots_slashes_'],
        ['non_letters_:£¢$∞', 'non_letters______'],
      ].map(([key, expected]) => {
        assert.strictEqual(normalizeLabelKey(key), expected);
      });
    });
  });

  describe('createTimeSeries', () => {
    it('should diag log a message when an unknown metric dataPointType type is passed in', () => {
      const data: MetricData = {
        // Invalid dataPointType representing a future added value
        dataPointType: 1000 as DataPointType.SUM,
        aggregationTemporality: AggregationTemporality.CUMULATIVE,
        dataPoints: [],
        descriptor: {
          description: '',
          name: '',
          unit: '',
          valueType: ValueType.DOUBLE,
        },
        isMonotonic: true,
      };

      createTimeSeries(data, {labels: {}, type: ''}, 'workload.googleapis.com');
      sinon.assert.calledOnceWithMatch(
        diagSpy.info,
        'Encountered unexpected dataPointType'
      );
    });

    /**
     * This example is adapted from the collector fixture test
     * https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/v0.39.0/exporter/collector/integrationtest/testdata/fixtures/metrics/exponential_histogram_metrics.json
     * to ensure they map the point the same way
     */
    it('should map ExponentialHistogram the same as the collector does', () => {
      // Copied from
      // https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/v0.39.0/exporter/collector/integrationtest/testdata/fixtures/metrics/exponential_histogram_metrics.json#L150-L166
      const data: ExponentialHistogramMetricData = {
        descriptor: {
          name: 'foohist',
          description: 'Some small exponential histogram',
          unit: '',
          valueType: ValueType.DOUBLE,
        },
        aggregationTemporality: 1,
        dataPointType: 1,
        dataPoints: [
          {
            attributes: {},
            startTime: [1687103020, 679000000],
            endTime: [1687103020, 680000000],
            value: {
              count: 7,
              sum: 12.5,
              scale: -1,
              zeroCount: 1,
              positive: {
                offset: -1,
                bucketCounts: [1, 3, 1],
              },
              negative: {
                bucketCounts: [1],
                offset: 0,
              },
            },
          },
        ],
      };

      assert.deepStrictEqual(
        createTimeSeries(
          data,
          {labels: {}, type: ''},
          'workload.googleapis.com'
        ),
        [
          {
            metric: {
              labels: {},
              type: 'workload.googleapis.com/foohist',
            },
            metricKind: 'CUMULATIVE',
            points: [
              {
                interval: {
                  endTime: '2023-06-18T15:43:40.680000000Z',
                  startTime: '2023-06-18T15:43:40.679000000Z',
                },
                // Should match
                // https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/v0.39.0/exporter/collector/integrationtest/testdata/fixtures/metrics/exponential_histogram_metrics_expect.json#L180-L198
                value: {
                  distributionValue: {
                    count: '7',
                    mean: 1.7857142857142858,
                    bucketOptions: {
                      exponentialBuckets: {
                        numFiniteBuckets: 3,
                        growthFactor: 4,
                        scale: 0.25,
                      },
                    },
                    bucketCounts: ['2', '1', '3', '1', '0'],
                  },
                },
              },
            ],
            resource: {
              labels: {},
              type: '',
            },
            valueType: 'DISTRIBUTION',
          },
        ]
      );
    });
  });
});
