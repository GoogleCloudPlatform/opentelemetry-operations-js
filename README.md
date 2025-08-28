# OpenTelemetry Operations Exporters for JavaScript

The packages in this repository support all [officially supported Node.js versions](https://nodejs.org/en/about/releases/) (18, 20, 22, 24).

To get started with instrumentation in Google Cloud, see [Generate traces and metrics with
Node.js](https://cloud.google.com/stackdriver/docs/instrumentation/setup/nodejs).

To learn more about instrumentation and observability, including opinionated recommendations
for Google Cloud Observability, visit [Instrumentation and
observability](https://cloud.google.com/stackdriver/docs/instrumentation/overview).

## OpenTelemetry Google Cloud Trace Exporter

[![npm version](https://badge.fury.io/js/%40google-cloud%2Fopentelemetry-cloud-trace-exporter.svg)](https://badge.fury.io/js/%40google-cloud%2Fopentelemetry-cloud-trace-exporter)

OpenTelemetry Google Cloud Trace Exporter allows the user to send collected traces to Google Cloud.

[Google Cloud Trace](https://cloud.google.com/trace) is a distributed tracing system. It helps gather timing data needed to troubleshoot latency problems in microservice architectures. It manages both the collection and lookup of this data.

### Getting Started

This exporter package assumes your application is [already instrumented](https://opentelemetry.io/docs/instrumentation/js/getting-started/) with the OpenTelemetry SDK. Once you are ready to export OpenTelemetry data, you can add this exporter to your application:

```sh
npm install --save @google-cloud/opentelemetry-cloud-trace-exporter
```


Add the exporter to your existing OpenTelemetry tracer provider (`NodeTracerProvider` / `BasicTracerProvider`)

```js
const { TraceExporter } = require('@google-cloud/opentelemetry-cloud-trace-exporter');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');


// Enable OpenTelemetry exporters to export traces to Google Cloud Trace.
// Exporters use Application Default Credentials (ADCs) to authenticate.
// See https://developers.google.com/identity/protocols/application-default-credentials
// for more details.

// Use your existing provider
const provider = new NodeTracerProvider();
provider.register();

// Initialize the exporter. When your application is running on Google Cloud,
// you don't need to provide auth credentials or a project id.
const exporter = new TraceExporter();

// Add the exporter to the provider
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
```
See [README.md](packages/opentelemetry-cloud-trace-exporter/README.md) for installation and usage information.

 
## OpenTelemetry Google Cloud Trace Propagator

 [![npm version](https://badge.fury.io/js/%40google-cloud%2Fopentelemetry-cloud-trace-propagator.svg)](https://badge.fury.io/js/%40google-cloud%2Fopentelemetry-cloud-trace-propagator)

OpenTelemetry Google Cloud Trace Propagator allows other services to create spans with the right context.

See [README.md](packages/opentelemetry-cloud-trace-propagator/README.md) for installation and usage information.

## OpenTelemetry Google Cloud Monitoring Exporter

[![npm version](https://badge.fury.io/js/%40google-cloud%2Fopentelemetry-cloud-monitoring-exporter.svg)](https://badge.fury.io/js/%40google-cloud%2Fopentelemetry-cloud-monitoring-exporter)

OpenTelemetry Google Cloud Monitoring Exporter allows the user to send collected metrics to Google Cloud Monitoring.

See [README.md](packages/opentelemetry-cloud-monitoring-exporter/README.md) for installation and usage information.
