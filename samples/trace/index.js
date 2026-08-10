// @ts-check
// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

// [START opentelemetry_trace_samples]
"use strict";

// [START opentelemetry_trace_import]
const opentelemetry = require("@opentelemetry/api");
const { resourceFromAttributes } = require("@opentelemetry/resources");
const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
  TraceExporter,
} = require("@google-cloud/opentelemetry-cloud-trace-exporter");
const {
  GcpDetectorSync,
} = require("@google-cloud/opentelemetry-resource-util");
// [END opentelemetry_trace_import]

// [START setup_exporter]
// Enable OpenTelemetry exporters to export traces to Google Cloud Trace.
// Exporters use Application Default Credentials (ADCs) to authenticate.
// See https://developers.google.com/identity/protocols/application-default-credentials
// for more details.

// Initialize the exporter. When your application is running on Google Cloud,
// you don't need to provide auth credentials or a project id.
const exporter = new TraceExporter();

// Initialize NodeSDK
const sdk = new NodeSDK({
  // Create a resource. Fill the `service.*` attributes in with real values for your service.
  // GcpDetectorSync will add in resource information about the current environment if you are
  // running on GCP.
  resource: resourceFromAttributes({
    "service.name": "example-trace-service",
    "service.namespace": "samples",
    "service.instance.id": "12345",
  }),
  resourceDetectors: [new GcpDetectorSync()],
  traceExporter: exporter,
});

sdk.start();
// [END setup_exporter]

// [START opentelemetry_trace_custom_span]

const tracer = opentelemetry.trace.getTracer("basic");

// Create a span.
const span = tracer.startSpan("foo");

// Set attributes to the span.
span.setAttribute("key", "value");

// Annotate our span to capture metadata about our operation
span.addEvent("invoking work");

// simulate some random work.
for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {}

// Be sure to end the span.
span.end();
// [END opentelemetry_trace_custom_span]

console.log("Done recording traces.");

// Finally shutdown the NodeSDK to finish flushing any batched spans
sdk.shutdown().then(
  () => {
    console.log("Successfully shutdown");
  },
  (err) => {
    console.error("Error shutting down", err);
  }
);
// [END opentelemetry_trace_samples]
