// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const {
  MeterProvider,
  PeriodicExportingMetricReader,
} = require("@opentelemetry/sdk-metrics");
const { Resource } = require("@opentelemetry/resources");
const {
  MetricExporter,
} = require("@google-cloud/opentelemetry-cloud-monitoring-exporter");
const {
  GcpDetectorSync,
} = require("@google-cloud/opentelemetry-resource-util");

// Create MeterProvider
const meterProvider = new MeterProvider({
  // Create a resource. Fill the `service.*` attributes in with real values for your service.
  // GcpDetectorSync will add in resource information about the current environment if you are
  // running on GCP. These resource attributes will be translated to a specific GCP monitored
  // resource if running on GCP. Otherwise, metrics will be sent with monitored resource
  // `generic_task`.
  resource: new Resource({
    "service.name": "example-metric-service",
    "service.namespace": "samples",
    "service.instance.id": "12345",
  }).merge(new GcpDetectorSync().detect()),
});
// Register the exporter
meterProvider.addMetricReader(
  new PeriodicExportingMetricReader({
    // Export metrics every 10 seconds. 5 seconds is the smallest sample period allowed by
    // Cloud Monitoring.
    exportIntervalMillis: 10_000,
    exporter: new MetricExporter(),
  })
);

// Create a meter
const meter = meterProvider.getMeter("metrics-sample");

// Create a counter instrument
const counter = meter.createCounter("metric_name");
// Record a measurement
counter.add(10, { key: "value" });

// Wait for the metric to be exported
new Promise((resolve) => {
  setTimeout(resolve, 11_000);
});
