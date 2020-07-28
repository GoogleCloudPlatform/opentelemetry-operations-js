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
'use strict';

// [START opentelemetry_trace_import]
const opentelemetry = require('@opentelemetry/api');
const {NodeTracerProvider} = require('@opentelemetry/node');
const {SimpleSpanProcessor} = require('@opentelemetry/tracing');
const { TraceExporter } = require('@google-cloud/opentelemetry-cloud-trace-exporter');
// [END opentelemetry_trace_import]

// [START setup_exporter]
// Enable OpenTelemetry exporters to export traces to Google Cloud Trace.
// Exporters use Application Default Credentials (ADCs) to authenticate.
// See https://developers.google.com/identity/protocols/application-default-credentials
// for more details.
const provider = new NodeTracerProvider();

// Initialize the exporter. When your application is running on Google Cloud,
// you don't need to provide auth credentials or a project id.
const exporter = new TraceExporter();

// Configure the span processor to send spans to the exporter
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

// [END setup_exporter]

// [START opentelemetry_trace_custom_span]

// Initialize the OpenTelemetry APIs to use the
// NodeTracerProvider bindings
opentelemetry.trace.setGlobalTracerProvider(provider);
const tracer = opentelemetry.trace.getTracer('basic');

// Create a span.
const span = tracer.startSpan('foo');

// Set attributes to the span.
span.setAttribute('key', 'value');

// Annotate our span to capture metadata about our operation
span.addEvent('invoking work');

// simulate some random work.
for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) { }

// Be sure to end the span.
span.end();
// [END opentelemetry_trace_custom_span]

console.log('Done recording traces.');

// [END opentelemetry_trace_samples]
