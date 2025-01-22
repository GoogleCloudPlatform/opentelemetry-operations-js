# Overview

This example shows how to send metrics to an OTLP *(OpenTelemetry Protocol)* endpoint that is protected by GCP authentication. The sample showcases the metric export using gRPC

## Installation

```sh
# from root of repo, build all packages
npm install
```

## Run the Application

```sh
# export necessary OTEL environment variables
export PROJECT_ID=<project-id>
export OTEL_EXPORTER_OTLP_ENDPOINT=<endpoint>
export OTEL_RESOURCE_ATTRIBUTES="gcp.project_id=$PROJECT_ID,service.name=otlp-sample"

# run the app - this starts app at port 8080
# the start script uses gRPC to export
cd samples/otlpmetricexport && npm run start
```

## View metrics

https://console.cloud.google.com//monitoring/metrics-explorer?project=your-project-id

1. Select the Metric from the dropdown. You should see it under the resource "Prometheus Target":
2. View the timeseries:

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on metrics, visit: <https://opentelemetry.io/docs/concepts/signals/metrics/>

## LICENSE

Apache License 2.0
