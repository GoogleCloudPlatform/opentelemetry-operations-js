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
import { Resource } from '@opentelemetry/resources';
import {
  MetricDescriptor,
  MetricKind,
  LabelDescriptor,
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
    labels: transformLabelDescriptor(metricDescriptor.labelKeys),
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

/** Transforms a LabelDescriptor from a LabelKey. */
function transformLabelDescriptor(labelKeys: string[]): LabelDescriptor[] {
  const labelDescriptorList: LabelDescriptor[] = labelKeys.map(labelKey => ({
    key: labelKey,
    description: labelKey, // TODO: add more descriptive description
  }));

  // add default "opentelemetry_task" label.
  labelDescriptorList.push({
    key: OPENTELEMETRY_TASK,
    description: OPENTELEMETRY_TASK_DESCRIPTION,
  });
  return labelDescriptorList;
}

/** Transforms a OpenTelemetry Type to a StackDriver MetricKind. */
function transformMetricKind(kind: OTMetricKind): MetricKind {
  if (kind === OTMetricKind.COUNTER) {
    return MetricKind.CUMULATIVE;
  } else if (kind === OTMetricKind.OBSERVER) {
    return MetricKind.GAUGE;
  }
  // TODO: add support from OTMetricKind.MEASURE
  return MetricKind.UNSPECIFIED;
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
 * Converts metric's timeseries to a list of TimeSeries, so that metric can be
 * uploaded to StackDriver.
 */
export function createTimeSeries(
  metric: MetricRecord,
  metricPrefix: string,
  startTime: string,
  projectId: string
): TimeSeries {
  return {
    metric: transformMetric(metric, metricPrefix),
    resource: transformResource(metric.resource, projectId),
    metricKind: transformMetricKind(metric.descriptor.metricKind),
    valueType: transformValueType(metric.descriptor.valueType),
    points: [
      transformPoint(metric.aggregator.toPoint(), metric.descriptor, startTime),
    ],
  };
}

 function transformResource(
  resource: Resource,
  projectId: string
): { type: string; labels: { [key: string]: string } } {
  const cloudProvider = `${resource.labels['cloud.provider']}`;
  // These are the only supported resources
  if (cloudProvider === 'gcp') {
    return {
      type: 'gce_instance',
      labels: {
        instance_id: `${resource.labels['host.id']}`,
        project_id: projectId,
        zone: `${resource.labels['cloud.zone']}`,
      },
    };
  } else if (cloudProvider === 'aws') {
    return {
      type: 'aws_ec2_instance',
      labels: {
        instance_id: `${resource.labels['host.id']}`,
        project_id: projectId,
        region: `${resource.labels['cloud.region']}`,
        aws_account: `${resource.labels['cloud.account.id']}`,
      },
    };
  }
  return { type: 'global', labels: {} };
}

function transformMetric(
  metric: MetricRecord,
  metricPrefix: string
): { type: string; labels: { [key: string]: string } } {
  const type = transformMetricType(metricPrefix, metric.descriptor.name);
  const labels: { [key: string]: string } = {};

  const keys = metric.descriptor.labelKeys;
  for (let i = 0; i < keys.length; i++) {
    if (metric.labels[keys[i]] !== null) {
      labels[keys[i]] = `${metric.labels[keys[i]]}`;
    }
  }
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
  if (metricDescriptor.metricKind === OTMetricKind.COUNTER) {
    return {
      value: transformValue(metricDescriptor.valueType, point.value),
      interval: {
        startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
  return {
    value: transformValue(metricDescriptor.valueType, point.value),
    interval: {
      endTime: new Date().toISOString(),
    },
  };
}

/** Transforms a OpenTelemetry Point's value to a StackDriver Point value. */
function transformValue(
  valueType: OTValueType,
  value: number | OTDistribution | OTHistogram
) {
  if (valueType === OTValueType.INT) {
    return { int64Value: value as number };
  } else if (valueType === OTValueType.DOUBLE) {
    return { doubleValue: value as number };
  }
  // TODO: Add support for Distribution and Histogram
  throw Error(`unsupported value type: ${valueType}`);
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
  transformLabelDescriptor,
  transformDisplayName,
  transformMetricType,
  transformMetric,
  transformPoint,
};
