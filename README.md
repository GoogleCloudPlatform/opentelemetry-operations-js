# OpenTelemetry Operations Exporters for JavaScript

## OpenTelemetry Google Cloud Trace Exporter

OpenTelemetry Google Cloud Trace Exporter allows the user to send collected traces to Google Cloud.

[Google Cloud Trace](https://cloud.google.com/trace) is a distributed tracing system. It helps gather timing data needed to troubleshoot latency problems in microservice architectures. It manages both the collection and lookup of this data.

### Getting Started

This exporter package assumes your application is [already instrumented](https://github.com/open-telemetry/opentelemetry-js/blob/master/getting-started/README.md) with the OpenTelemetry SDK. Once you are ready to export OpenTelemetry data, you can add this exporter to your application:

```sh
npm install --save @google-cloud/opentelemetry-cloud-trace-exporter
```


Add the exporter to your existing OpenTelemetry tracer provider (`NodeTracerProvider` / `BasicTracerProvider`)

```js
const { TraceExporter } = require('@google-cloud/opentelemetry-cloud-trace-exporter');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { BatchSpanProcessor } = require('@opentelemetry/tracing');


// Enable OpenTelemetry exporters to export traces to Google Cloud Trace.
// Exporters use Application Default Credentials (ADCs) to authenticate.
// See https://developers.google.com/identity/protocols/application-default-credentials
// for more details.

// Use your existing provider
const provider = new NodeTracerProvider();
provider.register();

// Initialize the exporter. When run in the Google Cloud Environment no
// project id or credentials are needed.
const exporter = new TraceExporter();

// Add the exporter to the provider
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
```
See [README.md](https://github.com/GoogleCloudPlatform/opentelemetry-operations-js/blob/master/packages/opentelemetry-cloud-trace-exporter/README.md) for installation and usage information.

## OpenTelemetry Google Cloud Monitoring Exporter

OpenTelemetry Google Cloud Monitoring Exporter allows the user to send collected metrics to Google Cloud Monitoring.

See [README.md](https://github.com/GoogleCloudPlatform/opentelemetry-operations-js/blob/master/packages/opentelemetry-cloud-monitoring-exporter/README.md) for installation and usage information.
