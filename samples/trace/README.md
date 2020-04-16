# Overview

This example shows how to use [@opentelemetry/node](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node) to instrument a simple Node.js application - e.g. a batch job - and export spans to [Google Cloud Trace](https://cloud.google.com/trace/).

## Installation

```sh
$ # from this directory
$ npm install
```

## Run the Application

```sh
$ # from this directory
$ npm start
```

## View traces

https://console.cloud.google.com/traces/list?project=your-project-id

<img width="1584" alt="Trace_Waterfall_View" src="images/Trace_Waterfall_View.png?raw=true"/>


## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on tracing, visit: <https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracing>

## LICENSE

Apache License 2.0
