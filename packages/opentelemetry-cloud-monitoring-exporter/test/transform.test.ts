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
  Point as OTPoint,
  MeterProvider,
} from '@opentelemetry/metrics';
import { ValueType as OTValueType, Labels } from '@opentelemetry/api';
import { MetricKind, ValueType, MetricDescriptor } from '../src/types';
import { Resource } from '@opentelemetry/resources';

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
    const point: OTPoint = {
      value: 50,
      timestamp: process.hrtime(),
    };
    const distributionPoint: OTPoint = {
      value: {
        min: 0,
        max: 100,
        count: 5,
        sum: 200,
      },
      timestamp: process.hrtime(),
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
        MetricKind.GAUGE
      );
    });

    it('should return a Google Cloud Monitoring ValueType', () => {
      assert.strictEqual(
        TEST_ONLY.transformValueType(OTValueType.INT, point),
        ValueType.INT64
      );
      assert.strictEqual(
        TEST_ONLY.transformValueType(OTValueType.DOUBLE, point),
        ValueType.DOUBLE
      );
      assert.strictEqual(
        TEST_ONLY.transformValueType(OTValueType.DOUBLE, distributionPoint),
        ValueType.DISTRIBUTION
      );
      assert.strictEqual(
        TEST_ONLY.transformValueType(2, point),
        ValueType.VALUE_TYPE_UNSPECIFIED
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
        'myorg/',
        point
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
        'myorg/',
        point
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
    const mockAwsResource = {
      'cloud.provider': 'aws',
      'host.id': 'host_id',
      'cloud.region': 'my-region',
      'cloud.account.id': '12345',
    };
    const mockAwsMonitoredResource = {
      type: 'aws_ec2_instance',
      labels: {
        instance_id: 'host_id',
        project_id: 'project_id',
        region: 'aws:my-region',
        aws_account: '12345',
      },
    };
    const mockGCResource = {
      'cloud.provider': 'gcp',
      'host.id': 'host_id',
      'cloud.zone': 'my-zone',
    };
    const mockGCMonitoredResource = {
      type: 'gce_instance',
      labels: {
        instance_id: 'host_id',
        project_id: 'project_id',
        zone: 'my-zone',
      },
    };

    it('should return a Google Cloud Monitoring Metric with a default resource', () => {
      const meter = new MeterProvider().getMeter('test-meter');
      const labels: Labels = { ['keya']: 'value1', ['keyb']: 'value2' };

      const counter = meter.createCounter(METRIC_NAME, {
        description: METRIC_DESCRIPTION,
      });
      counter.bind(labels).add(10);
      meter.collect();
      const [record] = meter.getBatcher().checkPointSet();
      const ts = createTimeSeries(
        record,
        'otel',
        new Date().toISOString(),
        'project_id'
      );
      assert.strictEqual(ts.metric.type, 'otel/metric-name');
      assert.strictEqual(ts.metric.labels['keya'], 'value1');
      assert.strictEqual(ts.metric.labels['keyb'], 'value2');
      assert.strictEqual(
        ts.metric.labels[TEST_ONLY.OPENTELEMETRY_TASK],
        OPENTELEMETRY_TASK_VALUE_DEFAULT
      );
      assert.deepStrictEqual(ts.resource, {
        labels: { project_id: 'project_id' },
        type: 'global',
      });
      assert.strictEqual(ts.metricKind, MetricKind.CUMULATIVE);
      assert.strictEqual(ts.valueType, ValueType.DOUBLE);
      assert.strictEqual(ts.points.length, 1);
      assert.deepStrictEqual(ts.points[0].value, { doubleValue: 10 });
    });
    it('should detect an AWS instance', () => {
      const meter = new MeterProvider({
        resource: new Resource(mockAwsResource),
      }).getMeter('test-meter');
      const labels: Labels = { ['keya']: 'value1', ['keyb']: 'value2' };
      const counter = meter.createCounter(METRIC_NAME, {
        description: METRIC_DESCRIPTION,
      });
      counter.bind(labels).add(10);
      meter.collect();
      const [record] = meter.getBatcher().checkPointSet();
      const ts = createTimeSeries(
        record,
        'otel',
        new Date().toISOString(),
        'project_id'
      );
      assert.deepStrictEqual(ts.resource, mockAwsMonitoredResource);
    });
    it('should detect a Google Cloud VM instance', () => {
      const meter = new MeterProvider({
        resource: new Resource(mockGCResource),
      }).getMeter('test-meter');
      const labels: Labels = { ['keya']: 'value1', ['keyb']: 'value2' };
      const counter = meter.createCounter(METRIC_NAME, {
        description: METRIC_DESCRIPTION,
      });
      counter.bind(labels).add(10);
      meter.collect();
      const [record] = meter.getBatcher().checkPointSet();
      const ts = createTimeSeries(
        record,
        'otel',
        new Date().toISOString(),
        'project_id'
      );
      assert.deepStrictEqual(ts.resource, mockGCMonitoredResource);
    });

    it('should return global for an incomplete resource', () => {
      // Missing host.id
      const incompleteResource = {
        'cloud.provider': 'gcp',
        'cloud.zone': 'my-zone',
      };
      const meter = new MeterProvider({
        resource: new Resource(incompleteResource),
      }).getMeter('test-meter');
      const labels: Labels = { ['keya']: 'value1', ['keyb']: 'value2' };
      const counter = meter.createCounter(METRIC_NAME, {
        description: METRIC_DESCRIPTION,
      });
      counter.bind(labels).add(10);
      meter.collect();
      const [record] = meter.getBatcher().checkPointSet();
      const ts = createTimeSeries(
        record,
        'otel',
        new Date().toISOString(),
        'project_id'
      );
      assert.deepStrictEqual(ts.resource, {
        labels: { project_id: 'project_id' },
        type: 'global',
      });
    });

    it('should return a Google Cloud Monitoring Metric for an observer', () => {
      const meter = new MeterProvider().getMeter('test-meter');
      const labels: Labels = { keya: 'value1', keyb: 'value2' };
      const observer = meter.createObserver(METRIC_NAME, {
        description: METRIC_DESCRIPTION,
        valueType: OTValueType.INT,
      });
      const int64Value = 0;
      observer.setCallback(result => {
        result.observe(() => int64Value, labels);
      });
      meter.collect();
      const [record] = meter.getBatcher().checkPointSet();
      const ts = createTimeSeries(
        record,
        'otel',
        new Date().toISOString(),
        'project_id'
      );
      assert(!ts.points[0].interval.startTime);
      assert(ts.points[0].interval.endTime);
      assert.strictEqual(ts.metric.type, `otel/${METRIC_NAME}`);
      assert.strictEqual(ts.metric.labels['keya'], 'value1');
      assert.strictEqual(ts.metric.labels['keyb'], 'value2');
      assert.strictEqual(
        ts.metric.labels[TEST_ONLY.OPENTELEMETRY_TASK],
        OPENTELEMETRY_TASK_VALUE_DEFAULT
      );
      assert.deepStrictEqual(ts.resource, {
        labels: { project_id: 'project_id' },
        type: 'global',
      });
      assert.strictEqual(ts.metricKind, MetricKind.GAUGE);
      assert.strictEqual(ts.valueType, ValueType.INT64);
      assert.strictEqual(ts.points.length, 1);
      assert.deepStrictEqual(ts.points[0].value, { int64Value });
    });

    it('should return a point', () => {
      const metricDescriptor: OTMetricDescriptor = {
        name: METRIC_NAME,
        description: METRIC_DESCRIPTION,
        unit: DEFAULT_UNIT,
        metricKind: OTMetricKind.OBSERVER,
        valueType: OTValueType.INT,
      };
      const point: OTPoint = {
        value: 50,
        timestamp: process.hrtime(),
      };

      const result = TEST_ONLY.transformPoint(
        point,
        metricDescriptor,
        new Date().toISOString()
      );

      assert.deepStrictEqual(result.value, { int64Value: 50 });
      assert(result.interval.endTime);
      assert(!result.interval.startTime);
    });

    it('should throw an error when given a distribution value', () => {
      const metricDescriptor: OTMetricDescriptor = {
        name: METRIC_NAME,
        description: METRIC_DESCRIPTION,
        unit: DEFAULT_UNIT,
        metricKind: OTMetricKind.COUNTER,
        valueType: OTValueType.DOUBLE,
      };
      const point: OTPoint = {
        value: {
          min: 20.0,
          max: 75.4,
          count: 22,
          sum: 150,
        },
        timestamp: process.hrtime(),
      };

      try {
        TEST_ONLY.transformPoint(
          point,
          metricDescriptor,
          new Date().toISOString()
        );
        assert.fail('should have thrown an error');
      } catch (err) {
        assert(err.message.toLowerCase().includes('distributions'));
      }
    });

    it('should thrown an error when given a histogram value', () => {
      const metricDescriptor: OTMetricDescriptor = {
        name: METRIC_NAME,
        description: METRIC_DESCRIPTION,
        unit: DEFAULT_UNIT,
        metricKind: OTMetricKind.COUNTER,
        valueType: OTValueType.DOUBLE,
      };
      const point: OTPoint = {
        value: {
          buckets: {
            boundaries: [10, 30],
            counts: [1, 2],
          },
          sum: 70,
          count: 3,
        },
        timestamp: process.hrtime(),
      };

      try {
        TEST_ONLY.transformPoint(
          point,
          metricDescriptor,
          new Date().toISOString()
        );
        assert.fail('should have thrown an error');
      } catch (err) {
        assert(err.message.toLowerCase().includes('histograms'));
      }
    });
  });
});
