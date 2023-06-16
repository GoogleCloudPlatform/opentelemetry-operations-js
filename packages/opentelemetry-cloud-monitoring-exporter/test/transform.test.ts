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
          type: InstrumentType.COUNTER,
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
  });
});
