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

// Create MeterProvider
const meterProvider = new MeterProvider({
  // Create a resource. These resources attributes will be translated to generic_task
  // monitoring resource labels in Cloud Monitoring
  resource: new Resource({
    "service.name": "example-metric-service",
    "service.namespace": "samples",
    "service.instance.id": "12345",
  }),
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
