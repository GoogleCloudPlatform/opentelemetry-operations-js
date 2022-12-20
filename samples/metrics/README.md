# Overview

This example shows how to use [@opentelemetry/sdk-metrics](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-metrics) to instrument a simple Node.js application and export metrics to [Google Cloud Monitoring](https://cloud.google.com/monitoring/).

## Installation

```sh
# from root of repo, build all packages
npm install
```

## Run the Application

```sh
# from this directory
npm start
```

## View metrics

https://console.cloud.google.com//monitoring/metrics-explorer?project=your-project-id

1. Select the Metric from the dropdown. You should see it under the resource "Generic Task":

   <img width="1584" alt="choose metric type" src="images/choose-metric-type.png?raw=true"/>

2. View the timeseries:

   <img width="1584" alt="view timeseries" src="images/metric-timeseries.png?raw=true"/>


## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on metrics, visit: <https://opentelemetry.io/docs/concepts/signals/metrics/>

## LICENSE

Apache License 2.0
