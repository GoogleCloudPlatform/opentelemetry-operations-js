# Overview

This example shows how to send traces to an OTLP *(OpenTelemetry Protocol)* endpoint that is protected by GCP authentication. The sample showcases the trace export using:
 - gRPC
 - http with protobuf
 - http with JSON

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
# the start script uses gRPC to export
cd samples/otlptraceexport && npm run start
```
Alternate run scripts available:
 -  `npm run start-http-proto` - will start a server that will export traces using http/protobuf.
 -  `npm run start-http-json` - will start a server that will export traces using http/json.

## Sending Requests to the Application

In another terminal window:

To send a one-off request:
```sh
curl localhost:8080/rolldice?rolls=12
```

To send requests indefinitely at a fixed rate, use the provided client application:
```sh
npm run client
```

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on tracing, visit: <https://opentelemetry.io/docs/concepts/signals/traces/>

## LICENSE

Apache License 2.0
