# OpenTelemetry Google Cloud Monitoring Exporter
[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

OpenTelemetry Google Cloud Monitoring Exporter allows the user to send collected metrics to Google Cloud Monitoring.

[Cloud Monitoring](https://cloud.google.com/monitoring) provides visibility into the performance, uptime, and overall health of cloud-powered applications. It collects metrics, events, and metadata from Google Cloud, Amazon Web Services, hosted uptime probes, application instrumentation, and a variety of common application components including Cassandra, Nginx, Apache Web Server, Elasticsearch, and many others. Operations ingests that data and generates insights via dashboards, charts, and alerts. Cloud Monitoring alerting helps you collaborate by integrating with Slack, PagerDuty, and more.

## Installation

```bash
npm install --save @opentelemetry/sdk-metrics
npm install --save @google-cloud/opentelemetry-cloud-monitoring-exporter
```

## Usage

```js
const { MeterProvider, PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");
const { Resource } = require("@opentelemetry/resources");
const { MetricExporter } = require("@google-cloud/opentelemetry-cloud-monitoring-exporter");
const { GcpDetectorSync } = require("@google-cloud/opentelemetry-resource-util");

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
```

### Enabling Exponential Histograms

This exporter can send OpenTelemetry Exponential Histograms to Google Cloud Monitoring. To use
this feature, add a metric [View][views] to configure `Histogram` instruments to use the
`ExponentialHistogram` aggregation:

```js
const {
  Aggregation,
  InstrumentType,
  MeterProvider,
  View
} = require("@opentelemetry/sdk-metrics");

const meterProvider = new MeterProvider({
  // ...
  views: [
    // To use ExponentialHistogram aggregation for all Histograms:
    new View({
      aggregation: Aggregation.ExponentialHistogram(),
      instrumentType: InstrumentType.HISTOGRAM,
    }),

    // Or if you'd only like to target a specific instrument:
    new View({
      aggregation: Aggregation.ExponentialHistogram(),
      instrumentType: InstrumentType.HISTOGRAM,
      instrumentName: "http.client.duration",
    }),
  ],
});
```

For more information on metric Views, see [Configure Metric Views][views].

##  Viewing your metrics:

With the above you should now be able to navigate to the Google Cloud Monitoring UI at: <https://console.cloud.google.com/monitoring>

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- Learn more about Google Cloud Monitoring at https://cloud.google.com/monitoring

[views]: https://opentelemetry.io/docs/instrumentation/js/manual/#configure-metric-views
[license-url]: https://github.com/GoogleCloudPlatform/opentelemetry-operations-js/blob/main/LICENSE
[npm-url]: https://www.npmjs.com/package/@google-cloud/opentelemetry-cloud-monitoring-exporter
[npm-img]: https://badge.fury.io/js/%40google-cloud%2Fopentelemetry-cloud-monitoring-exporter.svg
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
