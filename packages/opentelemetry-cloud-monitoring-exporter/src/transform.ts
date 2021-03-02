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
  Histogram as OTHistogram,
  Point as OTPoint,
  PointValueType,
} from '@opentelemetry/metrics';
import {ValueType as OTValueType} from '@opentelemetry/api-metrics';
import {
  Resource,
  CLOUD_RESOURCE,
  HOST_RESOURCE,
} from '@opentelemetry/resources';
import {
  MetricDescriptor,
  MetricKind,
  ValueType,
  TimeSeries,
  Point,
  MonitoredResource,
} from './types';
import * as path from 'path';
import * as os from 'os';
import type {monitoring_v3} from 'googleapis';

const OPENTELEMETRY_TASK = 'opentelemetry_task';
const OPENTELEMETRY_TASK_DESCRIPTION = 'OpenTelemetry task identifier';
const AWS_REGION_VALUE_PREFIX = 'aws:';
const GCP_GCE_INSTANCE = 'gce_instance';
const AWS_EC2_INSTANCE = 'aws_ec2_instance';
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

/**
 * Given a resource, return a MonitoredResource
 * If any field is missing, return the default resource
 * @param resource
 * @param projectId
 */
function transformResource(
  resource: Resource,
  projectId: string
): MonitoredResource {
  const templateResource = getTypeAndMappings(resource);
  const type = templateResource.type;
  const labels: {[key: string]: string} = {project_id: projectId};

  for (const key of Object.keys(templateResource.labels)) {
    // Checks the resource's value for a required key
    const resourceValue = resource.attributes[templateResource.labels[key]];
    if (!resourceValue) {
      return {type: 'global', labels: {project_id: projectId}};
    }
    if (
      type === AWS_EC2_INSTANCE &&
      templateResource.labels[key] === CLOUD_RESOURCE.REGION
    ) {
      labels[key] = `${AWS_REGION_VALUE_PREFIX}${resourceValue}`;
    } else {
      labels[key] = `${resourceValue}`;
    }
  }
  return {type, labels};
}

/**
 * Returns the type and mappings of a resource for a given cloud provider
 * The only currently supported cloud providers are GCP and AWS
 * @param resource
 */
function getTypeAndMappings(resource: Resource): MonitoredResource {
  const cloudProvider = `${resource.attributes[CLOUD_RESOURCE.PROVIDER]}`;
  if (cloudProvider === 'gcp') {
    return {
      type: GCP_GCE_INSTANCE,
      labels: {
        instance_id: HOST_RESOURCE.ID,
        zone: CLOUD_RESOURCE.ZONE,
      },
    };
  } else if (cloudProvider === 'aws') {
    return {
      type: AWS_EC2_INSTANCE,
      labels: {
        instance_id: HOST_RESOURCE.ID,
        region: CLOUD_RESOURCE.REGION,
        aws_account: CLOUD_RESOURCE.ACCOUNT_ID,
      },
    };
  }
  return {type: 'global', labels: {}};
}

function transformMetric(
  metric: MetricRecord,
  metricPrefix: string
): {type: string; labels: {[key: string]: string}} {
  const type = transformMetricType(metricPrefix, metric.descriptor.name);
  const labels: {[key: string]: string} = {};

  Object.keys(metric.labels).forEach(
    key => (labels[key] = `${metric.labels[key]}`)
  );
  labels[OPENTELEMETRY_TASK] = OPENTELEMETRY_TASK_VALUE_DEFAULT;
  return {type, labels};
}

/**
 * Transform timeseries's point, so that metric can be uploaded to StackDriver.
 */
function transformPoint(
  point: OTPoint<PointValueType>,
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
  value: PointValueType
): monitoring_v3.Schema$TypedValue {
  if (isHistogramValue(value)) {
    return {
      distributionValue: {
        // sumOfSquaredDeviation param not aggregated
        count: value.count.toString(),
        mean: value.sum / value.count,
        bucketOptions: {
          explicitBuckets: {bounds: value.buckets.boundaries},
        },
        bucketCounts: value.buckets.counts.map(count => count.toString()),
      },
    };
  }

  if (valueType === OTValueType.INT) {
    return {int64Value: value.toString()};
  } else if (valueType === OTValueType.DOUBLE) {
    return {doubleValue: value};
  }
  throw Error(`unsupported value type: ${valueType}`);
}

/** Returns true if value is of type OTHistogram */
function isHistogramValue(value: PointValueType): value is OTHistogram {
  return Object.prototype.hasOwnProperty.call(value, 'buckets');
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
