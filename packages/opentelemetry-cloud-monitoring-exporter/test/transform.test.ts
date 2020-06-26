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
import {
  TEST_ONLY,
  transformMetricDescriptor,
  createTimeSeries,
  OPENTELEMETRY_TASK_VALUE_DEFAULT,
} from '../src/transform';
import {
  MetricKind as OTMetricKind,
  MetricDescriptor as OTMetricDescriptor,
  MeterProvider,
} from '@opentelemetry/metrics';
import { ValueType as OTValueType, Labels } from '@opentelemetry/api';
import { MetricKind, ValueType, MetricDescriptor } from '../src/types';

describe('transform', () => {
  const METRIC_NAME = 'metric-name';
  const METRIC_DESCRIPTION = 'metric-description';
  const DEFAULT_UNIT = '1';

  describe('MetricDescriptor', () => {
    const metricDescriptor: OTMetricDescriptor = {
      name: METRIC_NAME,
      description: METRIC_DESCRIPTION,
      unit: DEFAULT_UNIT,
      metricKind: OTMetricKind.COUNTER,
      valueType: OTValueType.INT,
    };
    const metricDescriptor1: OTMetricDescriptor = {
      name: METRIC_NAME,
      description: METRIC_DESCRIPTION,
      unit: DEFAULT_UNIT,
      metricKind: OTMetricKind.OBSERVER,
      valueType: OTValueType.DOUBLE,
    };

    it('should return a Google Cloud Monitoring MetricKind', () => {
      assert.strictEqual(
        TEST_ONLY.transformMetricKind(OTMetricKind.COUNTER),
        MetricKind.CUMULATIVE
      );
      assert.strictEqual(
        TEST_ONLY.transformMetricKind(OTMetricKind.SUM_OBSERVER),
        MetricKind.CUMULATIVE
      );
      assert.strictEqual(
        TEST_ONLY.transformMetricKind(OTMetricKind.UP_DOWN_COUNTER),
        MetricKind.GAUGE
      );
      assert.strictEqual(
        TEST_ONLY.transformMetricKind(OTMetricKind.OBSERVER),
        MetricKind.GAUGE
      );
      assert.strictEqual(
        TEST_ONLY.transformMetricKind(OTMetricKind.VALUE_OBSERVER),
        MetricKind.GAUGE
      );
      assert.strictEqual(
        TEST_ONLY.transformMetricKind(OTMetricKind.UP_DOWN_SUM_OBSERVER),
        MetricKind.GAUGE
      );
      assert.strictEqual(
        TEST_ONLY.transformMetricKind(OTMetricKind.VALUE_RECORDER),
        MetricKind.UNSPECIFIED
      );
    });

    it('should return a Google Cloud Monitoring ValueType', () => {
      assert.strictEqual(
        TEST_ONLY.transformValueType(OTValueType.INT),
        ValueType.INT64
      );
      assert.strictEqual(
        TEST_ONLY.transformValueType(OTValueType.DOUBLE),
        ValueType.DOUBLE
      );
    });

    it('should return a Google Cloud Monitoring DisplayName', () => {
      assert.strictEqual(
        TEST_ONLY.transformDisplayName(
          'custom.googleapis.com/opentelemetry',
          'demo/latency'
        ),
        'custom.googleapis.com/opentelemetry/demo/latency'
      );
    });

    it('should return a Google Cloud Monitoring MetricType', () => {
      assert.strictEqual(
        TEST_ONLY.transformMetricType('opentelemetry', 'demo/latency'),
        'opentelemetry/demo/latency'
      );
    });

    it('should return a Cumulative Google Cloud Monitoring MetricDescriptor', () => {
      const descriptor: MetricDescriptor = transformMetricDescriptor(
        metricDescriptor,
        'custom.googleapis.com/myorg/',
        'myorg/'
      );

      assert.strictEqual(descriptor.description, METRIC_DESCRIPTION);
      assert.strictEqual(descriptor.displayName, `myorg/${METRIC_NAME}`);
      assert.strictEqual(
        descriptor.type,
        `custom.googleapis.com/myorg/${METRIC_NAME}`
      );
      assert.strictEqual(descriptor.unit, DEFAULT_UNIT);
      assert.strictEqual(descriptor.metricKind, MetricKind.CUMULATIVE);
      assert.strictEqual(descriptor.valueType, ValueType.INT64);
    });

    it('should return a Gauge Google Cloud Monitoring MetricDescriptor', () => {
      const descriptor: MetricDescriptor = transformMetricDescriptor(
        metricDescriptor1,
        'custom.googleapis.com/myorg/',
        'myorg/'
      );

      assert.strictEqual(descriptor.description, METRIC_DESCRIPTION);
      assert.strictEqual(descriptor.displayName, `myorg/${METRIC_NAME}`);
      assert.strictEqual(
        descriptor.type,
        `custom.googleapis.com/myorg/${METRIC_NAME}`
      );
      assert.strictEqual(descriptor.unit, DEFAULT_UNIT);
      assert.strictEqual(descriptor.metricKind, MetricKind.GAUGE);
      assert.strictEqual(descriptor.valueType, ValueType.DOUBLE);
    });
  });

  describe('TimeSeries', () => {
    it('should return a Google Cloud Monitoring Metric', () => {
      const meter = new MeterProvider().getMeter('test-meter');
      const labels: Labels = { ['keyb']: 'value2', ['keya']: 'value1' };

      const counter = meter.createCounter(METRIC_NAME, {
        description: METRIC_DESCRIPTION,
      });
      counter.bind(labels).add(10);
      meter.collect();
      const [record] = meter.getBatcher().checkPointSet();
      const ts = createTimeSeries(record, 'otel', new Date().toISOString());
      assert.strictEqual(ts.metric.type, 'otel/metric-name');
      assert.strictEqual(ts.metric.labels['keya'], 'value1');
      assert.strictEqual(ts.metric.labels['keyb'], 'value2');
      assert.strictEqual(
        ts.metric.labels[TEST_ONLY.OPENTELEMETRY_TASK],
        OPENTELEMETRY_TASK_VALUE_DEFAULT
      );
      assert.deepStrictEqual(ts.resource, {
        labels: {},
        type: 'global',
      });
      assert.strictEqual(ts.metricKind, MetricKind.CUMULATIVE);
      assert.strictEqual(ts.valueType, ValueType.DOUBLE);
      assert.strictEqual(ts.points.length, 1);
      assert.deepStrictEqual(ts.points[0].value, { doubleValue: 10 });
    });
  });
});
