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

import {
  MetricDescriptor as OTMetricDescriptor,
  MetricKind as OTMetricKind,
  MetricRecord,
  Distribution as OTDistribution,
  Histogram as OTHistogram,
  Point as OTPoint,
} from '@opentelemetry/metrics';
import { ValueType as OTValueType } from '@opentelemetry/api';
import {
  MetricDescriptor,
  MetricKind,
  ValueType,
  TimeSeries,
  Point,
} from './types';
import * as path from 'path';
import * as os from 'os';

const OPENTELEMETRY_TASK = 'opentelemetry_task';
const OPENTELEMETRY_TASK_DESCRIPTION = 'OpenTelemetry task identifier';
export const OPENTELEMETRY_TASK_VALUE_DEFAULT = generateDefaultTaskValue();

export function transformMetricDescriptor(
  metricDescriptor: OTMetricDescriptor,
  metricPrefix: string,
  displayNamePrefix: string
): MetricDescriptor {
  return {
    type: transformMetricType(metricPrefix, metricDescriptor.name),
    description: metricDescriptor.description,
    displayName: transformDisplayName(displayNamePrefix, metricDescriptor.name),
    metricKind: transformMetricKind(metricDescriptor.metricKind),
    valueType: transformValueType(metricDescriptor.valueType),
    unit: metricDescriptor.unit,
    labels: [
      {
        key: OPENTELEMETRY_TASK,
        description: OPENTELEMETRY_TASK_DESCRIPTION,
      },
    ],
  };
}

/** Transforms Metric type. */
function transformMetricType(metricPrefix: string, name: string): string {
  return path.join(metricPrefix, name);
}

/** Transforms Metric display name. */
function transformDisplayName(displayNamePrefix: string, name: string): string {
  return path.join(displayNamePrefix, name);
}

/** Transforms a OpenTelemetry Type to a StackDriver MetricKind. */
function transformMetricKind(kind: OTMetricKind): MetricKind {
  switch (kind) {
    case OTMetricKind.COUNTER:
    case OTMetricKind.SUM_OBSERVER:
      return MetricKind.CUMULATIVE;
    // OTMetricKind.OBSERVER will be removed in opentelemetry-js #1146
    case OTMetricKind.OBSERVER:
    case OTMetricKind.UP_DOWN_COUNTER:
    case OTMetricKind.VALUE_OBSERVER:
    case OTMetricKind.UP_DOWN_SUM_OBSERVER:
      return MetricKind.GAUGE;
    default:
      // TODO: Add support for OTMetricKind.ValueRecorder
      // OTMetricKind.Measure was renamed to ValueRecorder in #1117
      return MetricKind.UNSPECIFIED;
  }
}

/** Transforms a OpenTelemetry ValueType to a StackDriver ValueType. */
function transformValueType(valueType: OTValueType): ValueType {
  if (valueType === OTValueType.DOUBLE) {
    return ValueType.DOUBLE;
  } else if (valueType === OTValueType.INT) {
    return ValueType.INT64;
  } else {
    return ValueType.VALUE_TYPE_UNSPECIFIED;
  }
}

/**
 * Converts metric's timeseries to a TimeSeries, so that metric can be
 * uploaded to StackDriver.
 */
export function createTimeSeries(
  metric: MetricRecord,
  metricPrefix: string,
  startTime: string
): TimeSeries {
  return {
    metric: transformMetric(metric, metricPrefix),
    // TODO: Use Resource API here, once available in OpenTelemetry
    resource: { type: 'global', labels: {} },
    metricKind: transformMetricKind(metric.descriptor.metricKind),
    valueType: transformValueType(metric.descriptor.valueType),
    points: [
      transformPoint(metric.aggregator.toPoint(), metric.descriptor, startTime),
    ],
  };
}

function transformMetric(
  metric: MetricRecord,
  metricPrefix: string
): { type: string; labels: { [key: string]: string } } {
  const type = transformMetricType(metricPrefix, metric.descriptor.name);
  const labels: { [key: string]: string } = {};

  Object.keys(metric.labels).forEach(
    key => (labels[key] = `${metric.labels[key]}`)
  );
  labels[OPENTELEMETRY_TASK] = OPENTELEMETRY_TASK_VALUE_DEFAULT;
  return { type, labels };
}

/**
 * Transform timeseries's point, so that metric can be uploaded to StackDriver.
 */
function transformPoint(
  point: OTPoint,
  metricDescriptor: OTMetricDescriptor,
  startTime: string
): Point {
  // TODO: Add endTime and startTime support, once available in OpenTelemetry
  // Related issues: https://github.com/open-telemetry/opentelemetry-js/pull/893
  // and https://github.com/open-telemetry/opentelemetry-js/issues/488
  switch (metricDescriptor.metricKind) {
    case OTMetricKind.COUNTER:
    case OTMetricKind.SUM_OBSERVER:
      return {
        value: transformValue(metricDescriptor.valueType, point.value),
        interval: {
          startTime,
          endTime: new Date().toISOString(),
        },
      };
    default:
      return {
        value: transformValue(metricDescriptor.valueType, point.value),
        interval: {
          endTime: new Date().toISOString(),
        },
      };
  }
}

/** Transforms a OpenTelemetry Point's value to a StackDriver Point value. */
function transformValue(
  valueType: OTValueType,
  value: number | OTDistribution | OTHistogram
) {
  if (isDistributionValue(value)) {
    // TODO: Add support for Distribution
    throw new Error('Distributions are not yet supported');
  }
  if (isHistogramValue(value)) {
    // TODO: Add support for Histogram
    throw new Error('Histograms are not yet supported');
  }

  if (valueType === OTValueType.INT) {
    return { int64Value: value };
  } else if (valueType === OTValueType.DOUBLE) {
    return { doubleValue: value };
  }
  throw Error(`unsupported value type: ${valueType}`);
}

/** Returns true if value is of type OTDistribution */
function isDistributionValue(
  value: number | OTDistribution | OTHistogram
): value is OTDistribution {
  return value.hasOwnProperty('min');
}

/** Returns true if value is of type OTHistogram */
function isHistogramValue(
  value: number | OTDistribution | OTHistogram
): value is OTHistogram {
  return value.hasOwnProperty('buckets');
}

/** Returns a task label value in the format of 'nodejs-<pid>@<hostname>'. */
function generateDefaultTaskValue(): string {
  const pid = process.pid;
  const hostname = os.hostname() || 'localhost';
  return 'nodejs-' + pid + '@' + hostname;
}

export const TEST_ONLY = {
  transformMetricKind,
  transformValueType,
  transformDisplayName,
  transformMetricType,
  transformMetric,
  transformPoint,
  OPENTELEMETRY_TASK,
};
