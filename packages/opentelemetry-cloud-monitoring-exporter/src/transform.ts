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
  InstrumentDescriptor,
  InstrumentType,
  Histogram,
  MetricData,
  DataPoint,
  DataPointType,
} from '@opentelemetry/sdk-metrics';
import {ValueType as OTValueType, diag} from '@opentelemetry/api';
import {MonitoredResource} from '@google-cloud/opentelemetry-resource-util';
import {
  MetricDescriptor,
  MetricKind,
  Point,
  TimeSeries,
  Metric,
  ValueType,
} from './types';
import * as path from 'path';
import * as os from 'os';
import type {monitoring_v3} from 'googleapis';
import {PreciseDate} from '@google-cloud/precise-date';

const OPENTELEMETRY_TASK = 'opentelemetry_task';
const OPENTELEMETRY_TASK_DESCRIPTION = 'OpenTelemetry task identifier';
export const OPENTELEMETRY_TASK_VALUE_DEFAULT = generateDefaultTaskValue();

export function transformMetricDescriptor(
  instrumentDescriptor: InstrumentDescriptor,
  metricPrefix: string,
  displayNamePrefix: string
): MetricDescriptor {
  return {
    type: transformMetricType(metricPrefix, instrumentDescriptor.name),
    description: instrumentDescriptor.description,
    displayName: transformDisplayName(
      displayNamePrefix,
      instrumentDescriptor.name
    ),
    metricKind: transformMetricKind(instrumentDescriptor.type),
    valueType: transformValueType(instrumentDescriptor.valueType),
    unit: instrumentDescriptor.unit,
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
  return path.posix.join(metricPrefix, name);
}

/** Transforms Metric display name. */
function transformDisplayName(displayNamePrefix: string, name: string): string {
  return path.posix.join(displayNamePrefix, name);
}

/** Transforms a OpenTelemetry instrument type to a GCM MetricKind. */
function transformMetricKind(instrumentType: InstrumentType): MetricKind {
  switch (instrumentType) {
    case InstrumentType.COUNTER:
    case InstrumentType.OBSERVABLE_COUNTER:
    case InstrumentType.HISTOGRAM:
      return MetricKind.CUMULATIVE;
    case InstrumentType.UP_DOWN_COUNTER:
    case InstrumentType.OBSERVABLE_GAUGE:
    case InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
      return MetricKind.GAUGE;
    default:
      exhaust(instrumentType);
      diag.info('Encountered unexpected instrumentType=%s', instrumentType);
      return MetricKind.UNSPECIFIED;
  }
}

/** Transforms a OpenTelemetry ValueType to a GCM ValueType. */
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
 * uploaded to GCM.
 */
export function createTimeSeries<TMetricData extends MetricData>(
  metric: TMetricData,
  resource: MonitoredResource,
  metricPrefix: string
): TimeSeries[] {
  const metricKind = transformMetricKind(metric.descriptor.type);
  const valueType = transformValueType(metric.descriptor.valueType);

  return transformPoints(metric, metricPrefix).map(({point, metric}) => ({
    metric,
    resource,
    metricKind,
    valueType,
    points: [point],
  }));
}

function transformMetric<T>(
  point: DataPoint<T>,
  instrumentDescriptor: InstrumentDescriptor,
  metricPrefix: string
): {type: string; labels: {[key: string]: string}} {
  const type = transformMetricType(metricPrefix, instrumentDescriptor.name);
  const labels: {[key: string]: string} = {};

  Object.keys(point.attributes).forEach(
    key => (labels[key] = `${point.attributes[key]}`)
  );
  labels[OPENTELEMETRY_TASK] = OPENTELEMETRY_TASK_VALUE_DEFAULT;
  return {type, labels};
}

/**
 * Transform timeseries's point, so that metric can be uploaded to GCM.
 */
function transformPoints(
  metric: MetricData,
  metricPrefix: string
): {point: Point; metric: Metric}[] {
  switch (metric.dataPointType) {
    case DataPointType.SUM:
    case DataPointType.GAUGE:
      return metric.dataPoints.map(dataPoint => ({
        metric: transformMetric(dataPoint, metric.descriptor, metricPrefix),
        point: {
          value: transformNumberValue(
            metric.descriptor.valueType,
            dataPoint.value
          ),
          interval: {
            // Add start time for non-gauge points
            ...(metric.dataPointType === DataPointType.SUM && metric.isMonotonic
              ? {
                  startTime: new PreciseDate(dataPoint.startTime).toISOString(),
                }
              : null),
            endTime: new PreciseDate(dataPoint.endTime).toISOString(),
          },
        },
      }));
    case DataPointType.HISTOGRAM:
      return metric.dataPoints.map(dataPoint => ({
        metric: transformMetric(dataPoint, metric.descriptor, metricPrefix),
        point: {
          value: transformHistogramValue(dataPoint.value),
          interval: {
            startTime: new PreciseDate(dataPoint.startTime).toISOString(),
            endTime: new PreciseDate(dataPoint.endTime).toISOString(),
          },
        },
      }));
    default:
      exhaust(metric);
      diag.info(
        'Encountered unexpected dataPointType=%s, dropping the point',
        (metric as MetricData).dataPointType
      );
      break;
  }
  return [];
}

/** Transforms a OpenTelemetry Point's value to a GCM Point value. */
function transformNumberValue(
  valueType: OTValueType,
  value: number
): monitoring_v3.Schema$TypedValue {
  if (valueType === OTValueType.INT) {
    return {int64Value: value.toString()};
  } else if (valueType === OTValueType.DOUBLE) {
    return {doubleValue: value};
  }
  exhaust(valueType);
  throw Error(`unsupported value type: ${valueType}`);
}

function transformHistogramValue(
  value: Histogram
): monitoring_v3.Schema$TypedValue {
  return {
    distributionValue: {
      // sumOfSquaredDeviation param not aggregated
      count: value.count.toString(),
      mean: value.count && value.sum ? value.sum / value.count : 0,
      bucketOptions: {
        explicitBuckets: {bounds: value.buckets.boundaries},
      },
      bucketCounts: value.buckets.counts.map(count => count.toString()),
    },
  };
}

/** Returns a task label value in the format of 'nodejs-<pid>@<hostname>'. */
function generateDefaultTaskValue(): string {
  const pid = process.pid;
  const hostname = os.hostname() || 'localhost';
  return 'nodejs-' + pid + '@' + hostname;
}

/**
 * Assert switch case is exhaustive
 */
function exhaust(switchValue: never) {
  return switchValue;
}

export const TEST_ONLY = {
  transformMetricKind,
  transformValueType,
  transformDisplayName,
  transformMetricType,
  transformMetric,
  transformPoints,
  OPENTELEMETRY_TASK,
};
