# OpenTelemetry Google Cloud Trace Exporter
[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

OpenTelemetry Google Cloud Trace Exporter allows the user to send collected traces to Google Cloud.

[Google Cloud Trace](https://cloud.google.com/trace) is a distributed tracing system. It helps gather timing data needed to troubleshoot latency problems in microservice architectures. It manages both the collection and lookup of this data.

## Setup

Google Cloud Trace is a managed service provided by Google Cloud Platform.

## Installation

```bash
npm install --save @google-cloud/opentelemetry-cloud-trace-exporter
```

## Usage
Install the exporter on your application, register the exporter, and start tracing. If you are running in a GCP environment, the exporter will automatically authenticate using the environment's service account. If not, you will need to follow the instructions in [Authentication](#Authentication).

```js
const { TraceExporter } = require('@google-cloud/opentelemetry-cloud-trace-exporter');

const exporter = new TraceExporter({
  // If you are not in a GCP environment, you will need to provide your
  // service account key here. See the Authentication section below.
});
```

Now, register the exporter with the built-in
[`BatchSpanProcessor`](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.4.0/specification/trace/sdk.md#batching-processor)
which batches ended spans and passes them to the configured `SpanExporter`.

```js
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
```

## Resource attributes

By default, OpenTelemetry resource attributes which do not map to a monitored resource are ignored. If you wish to export other resource attributes, you must specify a regexp that should match the attribute keys you'd like.

For example, if you are setting up a resource with the "service" semantic attributes:
```typescript
const {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_NAMESPACE,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_SERVICE_INSTANCE_ID,
} = require('@opentelemetry/semantic-conventions');

const provider = new NodeTracerProvider({
  // ...
  resource: new Resource({

  SEMRESATTRS_SERVICE_NAME,
    [SEMRESATTRS_SERVICE_NAME]: 'things-service',
    [SEMRESATTRS_SERVICE_NAMESPACE]: 'things',
    [SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
    [SEMRESATTRS_SERVICE_INSTANCE_ID]: 'abc123',
  }),
})
```

You can ensure they are exported by using a regexp that matches them:
```typescript
const exporter = new TraceExporter({
  // will export all resource attributes that start with "service."
  resourceFilter: /^service\./
});
```

## Authentication

The Google Cloud Trace exporter supports authentication using service accounts. These can either be defined in a keyfile (usually called `service_account_key.json` or similar), or by the environment. If your application runs in a GCP environment, such as Compute Engine, you don't need to provide any application credentials. The client library will find the credentials by itself. For more information, go to <https://cloud.google.com/docs/authentication/>.

### Service account key

If you are not running in a GCP environment, you will need to give the service account credentials to the exporter.

```js
const { TraceExporter } = require('@google-cloud/opentelemetry-cloud-trace-exporter');

const exporter = new TraceExporter({
  /** option 1. provide a service account key json */
  keyFile: './service_account_key.json',
  keyFileName: './service_account_key.json',

  /** option 2. provide credentials directly */
  credentials: {
    client_email: string,
    private_key: string,
  },
});
```

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- Learn more about Google Cloud Trace at https://cloud.google.com/trace


[npm-url]: https://www.npmjs.com/package/@google-cloud/opentelemetry-cloud-trace-exporter
[npm-img]: https://badge.fury.io/js/%40google-cloud%2Fopentelemetry-cloud-trace-exporter.svg
[license-url]: https://github.com/GoogleCloudPlatform/opentelemetry-operations-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
