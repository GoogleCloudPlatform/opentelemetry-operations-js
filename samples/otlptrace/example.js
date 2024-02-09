// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

const {GoogleAuth} = require('google-auth-library');
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-proto');

async function main() {
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });
  const client = await auth.getClient();
  const headers = await client.getRequestHeaders();

  const sdk = new opentelemetry.NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: '<your-otlp-endpoint>/v1/traces',
      headers: {headers},
    })
  })
  sdk.start()

  const provider = new NodeTracerProvider();
  provider.register();
  const exporter = new OTLPTraceExporter

  const tracer = opentelemetry.trace.getTracer("basic");


  // Create a span.
  const span = tracer.startSpan("foo");

  // Set attributes to the span.
  span.setAttribute("key", "value");

  // Annotate our span to capture metadata about our operation
  span.addEvent("invoking work");

  // simulate some random work.
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {}

  // Be sure to end the span.
  span.end();
  // [END opentelemetry_trace_custom_span]

  console.log("Done recording traces.");

  // Finally shutdown the NodeTracerProvider to finish flushing any batched spans
  provider.shutdown().then(
      () => {
        console.log("Successfully shutdown");
      },
      (err) => {
        console.error("Error shutting down", err);
      }
  );

}
main().catch(console.error);
