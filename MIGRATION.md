# Migration Guide

This guide provides instructions on how to migrate from the custom exporters and propagators in this repository to the standard OpenTelemetry OTLP exporters and standard W3C Trace Context propagation.

## Overview

Google Cloud supports native OTLP (OpenTelemetry Protocol) ingestion for Cloud Trace and Cloud Monitoring via the [Telemetry API](https://docs.cloud.google.com/stackdriver/docs/reference/telemetry/overview). This allows you to use standard OpenTelemetry OTLP exporters for sending telemetry data to Google Cloud.

> [!WARNING]
> **Deprecation Notice:** All packages in this repository (`@google-cloud/opentelemetry-cloud-trace-exporter`, `@google-cloud/opentelemetry-cloud-monitoring-exporter`, `@google-cloud/opentelemetry-cloud-trace-propagator`, and `@google-cloud/opentelemetry-resource-util`) are deprecated. **They will be archived after September 30th, 2026.** Please migrate to standard OTLP exporters and standard OpenTelemetry libraries before this date.

---

## Resource Detection (Recommended for All Signals)

When migrating to OTLP exporters, installing the upstream GCP Resource Detector package ([@opentelemetry/resource-detector-gcp](https://www.npmjs.com/package/@opentelemetry/resource-detector-gcp)) automatically populates Google Cloud resource attributes (such as `gcp.project_id`, `cloud.account.id`, `host.id`, `k8s.pod.name`, etc.) for your OpenTelemetry SDK.

### Installation

```bash
npm install @opentelemetry/resource-detector-gcp @opentelemetry/resources @opentelemetry/sdk-node
```

### Usage & Configuration

Because the GCP resource detector performs asynchronous network I/O to fetch details from the GCP metadata server, you must use the asynchronous `detectResources` function. The modern and recommended way to initialize the SDK in Node.js is using `NodeSDK`.

```typescript
import { detectResources } from '@opentelemetry/resources';
import { gcpDetector } from '@opentelemetry/resource-detector-gcp';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

async function initialize(): Promise<void> {
  const resource = await detectResources({
    detectors: [gcpDetector],
  });

  const sdk = new NodeSDK({
    resource: resource,
    traceExporter: new OTLPTraceExporter(),
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('OpenTelemetry SDK terminated'))
      .catch((error) => console.error('Error terminating OpenTelemetry SDK', error));
  });
}

initialize().catch(console.error);
```

**Zero-Code Autoconfiguration Note:** When using `@opentelemetry/sdk-node` or `@opentelemetry/auto-instrumentations-node`, you can also use `getResourceDetectorsFromEnv()` or enable the detector via the `OTEL_EXPERIMENTAL_RESOURCE_DETECTORS="gcp"` environment variable. Note that direct export to `telemetry.googleapis.com` is broken in zero-code mode unless you export to an OpenTelemetry Collector, because there is no environment variable to pass dynamic Google OAuth2 tokens.

---

## Migrate from Google Cloud Trace Exporter (`TraceExporter`) to OTLP Exporter

To migrate from the legacy `@google-cloud/opentelemetry-cloud-trace-exporter` to the standard OpenTelemetry OTLP exporter, follow these steps:

### 1. Update Dependencies

```bash
npm uninstall @google-cloud/opentelemetry-cloud-trace-exporter
npm install @opentelemetry/exporter-trace-otlp-proto # Recommended for HTTP/Protobuf
# or npm install @opentelemetry/exporter-trace-otlp-http (for HTTP/JSON)
```

### 2. Configure the SDK

When exporting OTLP telemetry directly from your application to Google Cloud endpoints (`https://telemetry.googleapis.com`), you can use `google-auth-library` to supply Application Default Credentials (ADC). Because OAuth2 tokens expire after 1 hour, standard OpenTelemetry JS OTLP exporters natively support async header callbacks (for HTTP) and channel credentials wrapping (for gRPC) to dynamically supply fresh tokens:

```bash
npm install google-auth-library
# If using gRPC:
npm install @grpc/grpc-js

# Set the target endpoint in your environment
export OTEL_EXPORTER_OTLP_ENDPOINT="https://telemetry.googleapis.com"
```

*OTLP/HTTP Dynamic Auth Example:*
```typescript
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'; // or -http
import { AuthClient, GoogleAuth } from 'google-auth-library';
import { NodeSDK } from '@opentelemetry/sdk-node';

async function getAuthenticatedClient(): Promise<AuthClient> {
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });
  return await auth.getClient();
}

async function main(): Promise<void> {
  const authenticatedClient: AuthClient = await getAuthenticatedClient();

  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      async headers(): Promise<{ [index: string]: string }> {
        const rawHeaders = await authenticatedClient.getRequestHeaders();
        return Object.fromEntries(rawHeaders.entries());
      },
    }),
  });
  sdk.start();
}

main().catch(console.error);
```

*OTLP/gRPC Dynamic Auth Example:*
```typescript
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { AuthClient, GoogleAuth } from 'google-auth-library';
import { credentials } from '@grpc/grpc-js';
import { NodeSDK } from '@opentelemetry/sdk-node';

async function getAuthenticatedClient(): Promise<AuthClient> {
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });
  return await auth.getClient();
}

async function main(): Promise<void> {
  const authenticatedClient: AuthClient = await getAuthenticatedClient();

  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      credentials: credentials.combineChannelCredentials(
        credentials.createSsl(),
        credentials.createFromGoogleCredential({
          async getRequestHeaders(
            url?: string,
          ): Promise<{ [index: string]: string }> {
            const rawHeaders = await authenticatedClient.getRequestHeaders(url);
            return Object.fromEntries(rawHeaders.entries());
          },
        }),
      ),
    }),
  });
  sdk.start();
}

main().catch(console.error);
```

### 3. Follow the Migration Guide

For a complete code walkthrough, follow the official migration guide published at [Migrate from the Trace exporter to the OTLP endpoint](https://docs.cloud.google.com/trace/docs/migrate-to-otlp-endpoints).

### Data Model Differences & Data Limit Improvements

Cloud Trace’s backend uses the OpenTelemetry data model natively. Be aware of the following breaking changes to your data structure when migrating:

* **Resource Attributes Envelope:**
  - **Legacy Exporter:** Flattened resource attributes on the client side into span labels prefixed with `g.co/r/<resource_type>/<label_key>`.
  - **OTLP Exporter:** Preserves standard OpenTelemetry resource attributes natively in the `ResourceSpans` envelope. They are mapped server-side.
* **Semantic Conventions Remapping:**
  - **Legacy Exporter:** Performed client-side remapping of OpenTelemetry HTTP keys to legacy Cloud Trace `/http/` label keys (e.g., `http.method` → `/http/method`).
  - **OTLP Exporter:** Preserves standard OpenTelemetry semantic convention keys (e.g., `http.request.method`, `url.full`) verbatim. Update your queries accordingly.

### Unsupported Features

The following features of the legacy `TraceExporter` are not supported in standard OTLP exporters:
* **Resource Attribute Regex Filtering (`resourceFilter`)**: In the legacy `TraceExporter`, `resourceFilter` allowed filtering resource attributes via regex before copying them to span labels. Standard OTLP exports resource attributes attached to the SDK verbatim; regex filtering is not supported in the OTLP exporter.
* **Array Attribute Stringification (`stringifyArrayAttributes`)**: The legacy exporter provided an option to stringify array attributes. Standard OTLP exporters handle array attributes natively according to protocol specifications.
* **Custom Pre-configured Clients**: Passing pre-configured authentication or client objects directly into constructor options is replaced by standard `headers()` async callbacks or gRPC channel credentials.

### Mapping and Limitations

| Legacy `TraceExporterOptions` | OTLP Equivalent Property / Env Var | Notes |
| :--- | :--- | :--- |
| `projectId` | Resource attribute: `gcp.project_id` | Set via `OTEL_RESOURCE_ATTRIBUTES="gcp.project_id=your-project-id"` or detected automatically via `@opentelemetry/resource-detector-gcp`. |
| `credentials` / `keyFilename` / `keyFile` | OTLP Exporter Configuration | Handled dynamically via `google-auth-library` or externally via the OpenTelemetry Collector. |
| `apiEndpoint` | `otel.exporter.otlp.endpoint` / `OTEL_EXPORTER_OTLP_ENDPOINT` | Set it to `https://telemetry.googleapis.com`. |
| `resourceFilter` | N/A | Regex filtering is unsupported in OTLP. |
| `stringifyArrayAttributes` | N/A | Array attributes are handled natively by OTLP. |

---

## Migrate from Google Cloud Monitoring Exporter (`MetricExporter`) to OTLP Exporter

> [!WARNING]
> **Breaking Change Warning:** Migrating from the legacy Google Cloud Monitoring exporter to the standard OTLP exporter introduces breaking changes to your metric names.
>
> * **Legacy Exporter:** Ingests metrics under the `workload.googleapis.com/` domain (unless a custom prefix was configured).
> * **OTLP Exporter:** Ingests metrics under the `prometheus.googleapis.com/` domain by default.
>
> Because of this domain change, your metric names in Cloud Monitoring will change. **This will break existing dashboards and alerting policies, and cause data discontinuity** between your historical and new metrics.

### Why Migrate?

* **Standardization:** Aligns your application with the industry-standard OTLP protocol.
* **Google Managed Prometheus (GMP) Cost Savings:** Standard OTLP metrics are ingested into GMP, offering a highly scalable and cost-effective monitoring solution (~20x cheaper ingestion cost than legacy Cloud Monitoring API ingestion).
* **Future-proofing:** The legacy Google Cloud Monitoring exporter is deprecated and will be archived after September 30th, 2026. Migrating now ensures your monitoring pipeline remains supported.

---

### Migration Strategies

We recommend three paths for migration, depending on your operational requirements:

1. **Direct Migration (Recommended):** Migrate fully to the OTLP exporter and update your dashboards and alerts to use the new metric names under the `prometheus.googleapis.com/` domain.
2. **Transition via Double-Writing (Alternative):** Run both the legacy exporter and the OTLP exporter in parallel to validate the new pipeline without monitoring downtime, at the cost of temporary double-ingestion charges.
3. **Custom Metric Renaming / Wrapped Exporter (Alternative):** Wrap the standard OTLP exporter in a custom class to preserve legacy prefixes and maintain compatibility with existing dashboards.

---

### Strategy 1: Direct Migration (Recommended)

#### 1. Update Dependencies

```bash
npm uninstall @google-cloud/opentelemetry-cloud-monitoring-exporter
npm install @opentelemetry/exporter-metrics-otlp-proto
```

#### 2. Programmatic Configuration

Remember to include the full path suffix (`/v1/metrics`) when providing a `url` explicitly:

```typescript
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const exporter = new OTLPMetricExporter({
  url: 'https://telemetry.googleapis.com/v1/metrics',
  // Note: For direct in-app export to GCP, include the async headers() callback
  // or gRPC credentials shown in the Trace Exporter section above.
});

const sdk = new NodeSDK({
  metricReader: new PeriodicExportingMetricReader({
    exporter: exporter,
    exportIntervalMillis: 60000,
  }),
});

sdk.start();
```

#### 3. Recording Metrics and Adding Attributes

When migrating your application code, use standard OpenTelemetry API methods to create instruments and record measurements with metric attributes:

```typescript
import { metrics } from '@opentelemetry/api';

// Create a meter
const meter = metrics.getMeter('my-instrumentation');

// Metrics without a domain prefix default to prometheus.googleapis.com/
const counter = meter.createCounter('processed_jobs', {
  description: 'Number of processed jobs',
});

// Record a measurement with metric attributes
counter.add(1, { job_type: 'import', status: 'success' });
```

---

### Strategy 2: Transition via Double-Writing

> [!IMPORTANT]
> **Cost Warning:** Double-writing metrics will double your metric ingestion volume, which will increase your Google Cloud Monitoring costs during the transition period. It also slightly increases CPU and memory usage on your application.

Run both the legacy exporter and the OTLP exporter concurrently:

```typescript
import { metrics } from '@opentelemetry/api';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { MetricExporter } from '@google-cloud/opentelemetry-cloud-monitoring-exporter';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';

const legacyExporter = new MetricExporter();
const otlpExporter = new OTLPMetricExporter({
  url: 'https://telemetry.googleapis.com/v1/metrics',
});

// Configure MeterProvider with two PeriodicExportingMetricReaders to export to both backends
const meterProvider = new MeterProvider({
  readers: [
    new PeriodicExportingMetricReader({
      exporter: legacyExporter,
      exportIntervalMillis: 60000,
    }),
    new PeriodicExportingMetricReader({
      exporter: otlpExporter,
      exportIntervalMillis: 60000,
    }),
  ],
});

metrics.setGlobalMeterProvider(meterProvider);
```

#### Verification and Cutover

1. **Verify New Metrics Ingestion:** Once double-writing is deployed, verify in Metrics Explorer that new metrics are arriving successfully under the `prometheus.googleapis.com/` domain.
2. **Update Dashboards & Alerts:** Duplicate or update existing Cloud Monitoring dashboards and alerting policies to query `prometheus.googleapis.com/` metric names instead of `workload.googleapis.com/`.
3. **Decommission:** Once all dashboards are verified against the new OTLP metric data streams, remove `MetricExporter` to complete the migration and eliminate double-ingestion costs.

---

### Strategy 3: Custom Metric Prefixing / Wrapped Exporter

If you want to preserve legacy metric prefixes (such as `workload.googleapis.com/`) during migration, wrap your `OTLPMetricExporter` with a custom exporter wrapper that prepends the prefix before export. 

Because optional SDK methods can vary across versions, implement defensive existence checks to avoid runtime errors:

```typescript
import {
  PushMetricExporter,
  ResourceMetrics,
  InstrumentType,
  AggregationTemporality,
  Aggregation,
} from '@opentelemetry/sdk-metrics';
import { ExportResult } from '@opentelemetry/core';

export class PrefixedMetricExporter implements PushMetricExporter {
  constructor(
    private _delegate: PushMetricExporter,
    private _prefix: string,
  ) {}

  export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void,
  ): void {
    // Deep clone to avoid mutating shared state across exporters
    const clonedMetrics: ResourceMetrics = {
      resource: metrics.resource,
      scopeMetrics: metrics.scopeMetrics.map(scopeMetric => ({
        scope: scopeMetric.scope,
        metrics: scopeMetric.metrics.map(metric => {
          const existingName = metric.descriptor.name;
          // Guard against double-prefixing metrics that already specify a domain prefix
          const prefixedName =
            existingName.startsWith(this._prefix) || existingName.includes('/')
              ? existingName
              : `${this._prefix}${existingName}`;
          return {
            ...metric,
            descriptor: {
              ...metric.descriptor,
              name: prefixedName,
            },
          };
        }),
      })),
    };
    this._delegate.export(clonedMetrics, resultCallback);
  }

  forceFlush(): Promise<void> {
    return this._delegate.forceFlush();
  }

  shutdown(): Promise<void> {
    return this._delegate.shutdown();
  }

  selectAggregationTemporality(
    instrumentType: InstrumentType,
  ): AggregationTemporality {
    if (this._delegate.selectAggregationTemporality) {
      return this._delegate.selectAggregationTemporality(instrumentType);
    }
    return AggregationTemporality.CUMULATIVE;
  }

  selectAggregation(instrumentType: InstrumentType): Aggregation | undefined {
    if (this._delegate.selectAggregation) {
      return this._delegate.selectAggregation(instrumentType);
    }
    return undefined;
  }
}
```

**Usage Example (TypeScript):**
```typescript
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { PrefixedMetricExporter } from './PrefixedMetricExporter';

const otlpExporter = new OTLPMetricExporter({
  url: 'https://telemetry.googleapis.com/v1/metrics',
});

const prefixedExporter = new PrefixedMetricExporter(
  otlpExporter,
  'workload.googleapis.com/',
);

const sdk = new NodeSDK({
  metricReader: new PeriodicExportingMetricReader({
    exporter: prefixedExporter,
    exportIntervalMillis: 60000,
  }),
});

sdk.start();
```

### Unsupported Features

The following features of the legacy `MetricExporter` are not supported in standard OTLP exporters:
* **Metric Descriptor Strategy (`disableCreateMetricDescriptors`)**: Legacy `MetricExporter` allowed disabling metric descriptor creation. In OTLP, metadata is handled automatically by the backend Telemetry API; client-side descriptor toggling is inapplicable.
* **Custom Prefix via Exporter Option (`prefix`)**: Legacy exporter accepted a `prefix` constructor option. Standard OTLP exporters ingest under `prometheus.googleapis.com/` by default. Preserving prefixes requires instrumentation changes or Strategy 3 (wrapped exporter).
* **Custom User-Agent Overrides (`userAgent`)**: Custom User-Agent overrides via exporter options are not supported in standard OTLP exporters; use standard OpenTelemetry resource attributes (`service.name`, `service.version`).

The Google Cloud Telemetry API converts OTLP metric data according to the official [Google Cloud Telemetry API Metric Mapping specification](https://docs.cloud.google.com/stackdriver/docs/reference/telemetry/v1.metrics#metric-mapping-reference-info).

Please refer to the specification documentation for complete, up-to-date details on how metric kinds, temporality, value types (`INT64` to `DOUBLE`), special characters, and resource attributes are mapped server-side in Google Cloud Monitoring.

### Mapping and Limitations

| Legacy `ExporterOptions` | OTLP Equivalent Property / Env Var | Notes |
| :--- | :--- | :--- |
| `projectId` | Resource attribute: `gcp.project_id` | Set via `OTEL_RESOURCE_ATTRIBUTES` or detected automatically. |
| `credentials` / `keyFilename` / `keyFile` | OTLP Exporter Configuration | Handled dynamically via `google-auth-library` or externally via the OpenTelemetry Collector. |
| `prefix` (default `workload.googleapis.com`) | N/A | Legacy ingested under `workload.googleapis.com/`. OTLP ingests under `prometheus.googleapis.com/` by default. See Strategy 3 for preserving prefixes. |
| `apiEndpoint` | `otel.exporter.otlp.endpoint` / `OTEL_EXPORTER_OTLP_ENDPOINT` | Set it to `https://telemetry.googleapis.com`. |
| `disableCreateMetricDescriptors` | N/A | OTLP endpoints handle descriptors automatically server-side. |
| `userAgent` | N/A | Custom User-Agent overrides are handled via standard OpenTelemetry resource attributes. |

---

## Migrate from Google Cloud Trace Propagator (`CloudPropagator`) to Standard Propagation

To migrate from the legacy `@google-cloud/opentelemetry-cloud-trace-propagator`, replace it with the standard OpenTelemetry W3C Trace Context propagator. Google Cloud infrastructure natively supports standard W3C Trace Context headers.

> [!NOTE]
> **Out-of-the-Box Default:** When initializing your application with `NodeSDK` (`@opentelemetry/sdk-node`), `W3CTraceContextPropagator` and `W3CBaggagePropagator` are configured automatically by default. You do not need to call `setGlobalPropagator` manually unless you are modifying or extending the default propagator chain.

### 1. Update Dependencies

```bash
npm uninstall @google-cloud/opentelemetry-cloud-trace-propagator
npm install @opentelemetry/api @opentelemetry/core
```

### 2. Programmatic Configuration

Replace `CloudPropagator` with `W3CTraceContextPropagator`:

```typescript
import { propagation } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

// Set the global propagator to use standard W3C Trace Context
propagation.setGlobalPropagator(new W3CTraceContextPropagator());
```
