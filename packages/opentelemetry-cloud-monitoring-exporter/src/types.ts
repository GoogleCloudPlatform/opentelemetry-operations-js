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

import type {monitoring_v3} from 'googleapis';

/**
 * Defines a metric type and its schema.
 * See: https://cloud.google.com/monitoring/api/ref_v3/rest/v3/projects.metricDescriptors
 */
export interface MetricDescriptor
  extends monitoring_v3.Schema$MetricDescriptor {
  description: string;
  displayName: string;
  type: string;
  metricKind: MetricKind;
  valueType: ValueType;
  unit: string;
  labels: LabelDescriptor[];
}

/**
 * A collection of data points that describes the time-varying values of a
 * metric. A time series is identified by a combination of a fully-specified
 * monitored resource and a fully-specified metric.
 */
export interface TimeSeries extends monitoring_v3.Schema$TimeSeries {
  metric: {type: string; labels: {[key: string]: string}};
  resource: MonitoredResource;
  metricKind: MetricKind;
  valueType: ValueType;
  points: Point[];
}

/**
 * The kind of measurement. It describes how the data is reported.
 */
export enum MetricKind {
  UNSPECIFIED = 'METRIC_KIND_UNSPECIFIED',
  GAUGE = 'GAUGE',
  DELTA = 'DELTA',
  CUMULATIVE = 'CUMULATIVE',
}

/** The value type of a metric. */
export enum ValueType {
  VALUE_TYPE_UNSPECIFIED = 'VALUE_TYPE_UNSPECIFIED',
  INT64 = 'INT64',
  DOUBLE = 'DOUBLE',
  DISTRIBUTION = 'DISTRIBUTION',
}

/** A description of a label. */
export interface LabelDescriptor extends monitoring_v3.Schema$LabelDescriptor {
  key: string;
  description: string;
}

/** Resource information. */
export interface MonitoredResource {
  type: string;
  labels: {[key: string]: string};
}

/** A single data point in a time series. */
export interface Point extends monitoring_v3.Schema$Point {
  interval: {endTime: string; startTime?: string};
}

export type Bucket = number;

/**
 * Exemplars are example points that may be used to annotate aggregated
 * Distribution values. They are metadata that gives information about a
 * particular value added to a Distribution bucket.
 */
export interface Exemplar {
  value: number;
  timestamp: string;
  attachments: Any[];
}

/**
 * `Any` contains an arbitrary serialized protocol buffer message along with a
 * URL that describes the type of the serialized message.
 */
export interface Any {
  '@type': string;
  value: string;
}
