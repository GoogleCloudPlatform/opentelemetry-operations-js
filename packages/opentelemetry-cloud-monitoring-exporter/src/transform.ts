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
  Histogram,
  MetricData,
  DataPoint,
  DataPointType,
  ExponentialHistogram,
} from '@opentelemetry/sdk-metrics';
import {HrTime, ValueType as OTValueType, diag} from '@opentelemetry/api';
import {MonitoredResource} from '@google-cloud/opentelemetry-resource-util';
import {
  MetricDescriptor,
  MetricKind,
  Point,
  TimeSeries,
  Metric,
  ValueType,
  LabelDescriptor,
} from './types';
import {exp2, numbersToStrings} from './utils';
import * as path from 'path';
import type {monitoring_v3} from 'googleapis';
import {PreciseDate} from '@google-cloud/precise-date';

/**
 *
 * @param metric the MetricData to create a descriptor for
 * @param metricPrefix prefix to add to metric names
 * @param displayNamePrefix prefix to add to display name in the descriptor
 * @returns the GCM MetricDescriptor or null if the MetricData was empty
 */
export function transformMetricDescriptor(
  metric: MetricData,
  metricPrefix: string
): MetricDescriptor {
  const {
    descriptor: {name, description, unit},
  } = metric;

  return {
    type: transformMetricType(metricPrefix, name),
    description,
    displayName: name,
    metricKind: transformMetricKind(metric),
    valueType: transformValueType(metric),
    unit,
    labels: transformLabelDescriptors(metric),
  };
}

function transformLabelDescriptors(metric: MetricData): LabelDescriptor[] {
  if (metric.dataPoints.length === 0) {
    return [];
  }

  const attrs = metric.dataPoints[0].attributes;
  return Object.keys(attrs).map(key => ({
    key: normalizeLabelKey(key),
    description: '',
  }));
}

/** Transforms Metric type. */
function transformMetricType(metricPrefix: string, name: string): string {
  return path.posix.join(metricPrefix, name);
}

/** Transforms a OpenTelemetry instrument type to a GCM MetricKind. */
function transformMetricKind(metric: MetricData): MetricKind {
  switch (metric.dataPointType) {
    case DataPointType.SUM:
      return metric.isMonotonic ? MetricKind.CUMULATIVE : MetricKind.GAUGE;
    case DataPointType.GAUGE:
      return MetricKind.GAUGE;
    case DataPointType.HISTOGRAM:
    case DataPointType.EXPONENTIAL_HISTOGRAM:
      return MetricKind.CUMULATIVE;
    default:
      exhaust(metric);
      // No logging needed as it will be done in transformPoints()
      return MetricKind.UNSPECIFIED;
  }
}

/** Transforms a OpenTelemetry ValueType to a GCM ValueType. */
function transformValueType(metric: MetricData): ValueType {
  const {
    dataPointType,
    descriptor: {valueType},
  } = metric;

  switch (dataPointType) {
    case DataPointType.HISTOGRAM:
    case DataPointType.EXPONENTIAL_HISTOGRAM:
      return ValueType.DISTRIBUTION;
    case DataPointType.GAUGE:
    case DataPointType.SUM:
      // handle below
      break;
    default:
      exhaust(dataPointType);
      // No logging needed as it will be done in transformPoints()
      return ValueType.VALUE_TYPE_UNSPECIFIED;
  }

  switch (valueType) {
    case OTValueType.DOUBLE:
      return ValueType.DOUBLE;
    case OTValueType.INT:
      return ValueType.INT64;
    default:
      exhaust(valueType);
      diag.info('Encountered unexpected value type %s', valueType);
      return ValueType.VALUE_TYPE_UNSPECIFIED;
  }
}

/**
 * Converts metric's timeseries to a TimeSeries, so that metric can be
 * uploaded to GCM.
 */
export function createTimeSeries(
  metric: MetricData,
  resource: MonitoredResource,
  metricPrefix: string
): TimeSeries[] {
  const metricKind = transformMetricKind(metric);
  const valueType = transformValueType(metric);

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

  Object.keys(point.attributes).forEach(key => {
    labels[normalizeLabelKey(key)] = `${point.attributes[key]}`;
  });
  return {type, labels};
}

/**
 * Transform timeseries' point, so that metric can be uploaded to GCM.
 */
function transformPoints(
  metric: MetricData,
  metricPrefix: string
): {point: Point; metric: Metric}[] {
  try {
    switch (metric.dataPointType) {
      case DataPointType.SUM:
      case DataPointType.GAUGE:
        return metric.dataPoints.map(dataPoint => {
          const {safeStartTime, safeEndTime} = validateMetricTimes(dataPoint);
          return {
            metric: transformMetric(dataPoint, metric.descriptor, metricPrefix),
            point: {
              value: transformNumberValue(
                metric.descriptor.valueType,
                dataPoint.value
              ),
              interval: {
                // Add start time for non-gauge points
                ...(metric.dataPointType === DataPointType.SUM &&
                metric.isMonotonic
                  ? {
                      startTime: new PreciseDate(safeStartTime).toISOString(),
                    }
                  : null),
                endTime: new PreciseDate(safeEndTime).toISOString(),
              },
            },
          };
        });
      case DataPointType.HISTOGRAM:
        return metric.dataPoints.map(dataPoint => {
          const {safeStartTime, safeEndTime} = validateMetricTimes(dataPoint);
          return {
            metric: transformMetric(dataPoint, metric.descriptor, metricPrefix),
            point: {
              value: transformHistogramValue(dataPoint.value),
              interval: {
                startTime: new PreciseDate(safeStartTime).toISOString(),
                endTime: new PreciseDate(safeEndTime).toISOString(),
              },
            },
          };
        });
      case DataPointType.EXPONENTIAL_HISTOGRAM:
        return metric.dataPoints.map(dataPoint => {
          const {safeStartTime, safeEndTime} = validateMetricTimes(dataPoint);
          return {
            metric: transformMetric(dataPoint, metric.descriptor, metricPrefix),
            point: {
              value: transformExponentialHistogramValue(dataPoint.value),
              interval: {
                startTime: new PreciseDate(safeStartTime).toISOString(),
                endTime: new PreciseDate(safeEndTime).toISOString(),
              },
            },
          };
        });
      default:
        exhaust(metric);
        diag.info(
          'Encountered unexpected dataPointType=%s, dropping %s points',
          (metric as MetricData).dataPointType,
          (metric as MetricData).dataPoints.length
        );
        break;
    }
  } catch (e) {
    diag.warn(
      'Invalid dataPoint encountered, dropping %s points',
      (metric as MetricData).dataPoints.length
    );
  }
  return [];
}

/**
 * Returns the start and end times from the DataPoint with the second and
 * nanosecond timestamps rounded to the nearest integer. This prevents
 * errors in downstream processing when an integer timestamp value inadvertently
 * gets a decimal component due to numeric precision issues in integer math.
 */
function validateMetricTimes<T>(dataPoint: DataPoint<T>): {
  safeStartTime: HrTime;
  safeEndTime: HrTime;
} {
  const safeStartTime: HrTime = [
    Math.round(dataPoint.startTime[0]),
    Math.round(dataPoint.startTime[1]),
  ];
  const safeEndTime: HrTime = [
    Math.round(dataPoint.endTime[0]),
    Math.round(dataPoint.endTime[1]),
  ];
  return {safeStartTime, safeEndTime};
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
      bucketCounts: numbersToStrings(value.buckets.counts),
    },
  };
}

function transformExponentialHistogramValue(
  value: ExponentialHistogram
): monitoring_v3.Schema$TypedValue {
  // Adapated from reference impl in Go which has more explanatory comments
  // https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/v1.8.0/exporter/collector/metrics.go#L582
  const underflow =
    value.zeroCount +
    value.negative.bucketCounts.reduce((prev, current) => prev + current, 0);
  const bucketCounts = [
    underflow,
    ...value.positive.bucketCounts,
    0, // overflow bucket is always empty
  ];

  let bucketOptions: monitoring_v3.Schema$BucketOptions;
  if (value.positive.bucketCounts.length === 0) {
    bucketOptions = {
      explicitBuckets: {bounds: []},
    };
  } else {
    const growthFactor = exp2(exp2(-value.scale));
    const scale = Math.pow(growthFactor, value.positive.offset);
    bucketOptions = {
      exponentialBuckets: {
        growthFactor,
        scale,
        numFiniteBuckets: bucketCounts.length - 2,
      },
    };
  }

  const mean =
    value.sum === undefined || value.count === 0 ? 0 : value.sum / value.count;

  return {
    distributionValue: {
      // sumOfSquaredDeviation param not aggregated
      count: value.count.toString(),
      mean,
      bucketOptions,
      bucketCounts: numbersToStrings(bucketCounts),
    },
  };
}

function normalizeLabelKey(key: string): string {
  // Replace characters which are not Letter or Decimal_Number unicode category with "_", see
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Unicode_Property_Escapes
  //
  // Reimplementation of reference impl in Go:
  // https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/e955c204f4f2bfdc92ff0ad52786232b975efcc2/exporter/metric/metric.go#L595-L604
  let sanitized = key.replace(/[^\p{Letter}\p{Decimal_Number}_]/gu, '_');

  if (sanitized[0].match(/\p{Decimal_Number}/u)) {
    sanitized = 'key_' + sanitized;
  }
  return sanitized;
}

/**
 * Assert switch case is exhaustive
 */
function exhaust(switchValue: never) {
  return switchValue;
}

export const _TEST_ONLY = {
  normalizeLabelKey,
};
