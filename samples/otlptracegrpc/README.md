# Overview

This example shows how to send traces to an OTLP *(OpenTelemetry Protocol)* endpoint that is protected by GCP authentication over gRPC.

## Installation

```sh
# from root of repo, build all packages
npm install
```

## Run the Application

```sh
# export necessary OTEL environment variables
export OTEL_RESOURCE_ATTRIBUTES="gcp.project_id=<project-id>"
export OTEL_EXPORTER_OTLP_ENDPOINT=<endpoint>

# run the app - this starts app at port 8080
cd samples/otlptracegrpc && npm run start
```

## Sending Requests to the Application

In another terminal window:

```sh
curl localhost:8080/rolldice?rolls=12
```

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on tracing, visit: <https://opentelemetry.io/docs/concepts/signals/traces/>

## LICENSE

Apache License 2.0