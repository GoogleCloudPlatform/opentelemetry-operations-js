# OpenTelemetry Google Cloud Trace Propagator
[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

OpenTelemetry Google Cloud Trace Propagator allow other services to create spans with the right context.

Format:
`TRACE_ID/SPAN_ID;o=TRACE_TRUE`

* {TRACE_ID}
    * is a 32-character hexadecimal value representing a 128-bit number.
    * It should be unique between your requests, unless you intentionally want to bundle the requests together.

* {SPAN_ID}
    * is the decimal representation of the (unsigned) span ID.
    * It should be 0 for the first span in your trace.
    * For subsequent requests, set SPAN_ID to the span ID of the parent request.

* {TRACE_TRUE}
    * must be 1 to trace request. Specify 0 to not trace the request.

## Usage

```javascript
const { NodeTracerProvider } = require('@opentelemetry/node');
const { CloudPropagator } = require('@google-cloud/opentelemetry-cloud-trace-propagator');

const provider = new NodeTracerProvider();
provider.register({
  // Use CloudPropagator
  propagator: new CloudPropagator()
});
```

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- Learn more about Google Cloud Trace at https://cloud.google.com/trace

[npm-url]: https://www.npmjs.com/package/@google-cloud/opentelemetry-cloud-trace-propagator
[npm-img]: https://badge.fury.io/js/%40google-cloud%2Fopentelemetry-cloud-trace-propagator.svg
[license-url]: https://github.com/GoogleCloudPlatform/opentelemetry-operations-js/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
