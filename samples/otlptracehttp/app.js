// Copyright OpenTelemetry Authors
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

/*app.js*/
const { trace } = require('@opentelemetry/api');
const express = require('express');
const { rollTheDice } = require('./dice.js');

const tracer = trace.getTracer('dice-server', '0.1.0');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

const opentelemetry = require('@opentelemetry/sdk-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const {GoogleAuth} = require('google-auth-library');

async function main() {
  async function getAuthenticatedClient() {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });
    const client = await auth.getClient();
    return client;
  }

  const authenticatedClient = await getAuthenticatedClient();
  const authHeaders = await authenticatedClient.getRequestHeaders();

  // Handle token refresh
  authenticatedClient.refreshHandler = async () => {
    console.log(`Token expired, current headers: ${otlpTraceExporter.headers}`)
    const refreshedHeader = await authenticatedClient.getRequestHeaders();
    const updatedHeaders = {
      ...otlpTraceExporter.headers,
      ...refreshedHeader,
    };
    otlpTraceExporter.headers = updatedHeaders
    console.log(`Token refreshed, updated header: ${otlpTraceExporter.headers}`)
  }

  const otlpTraceExporter = new OTLPTraceExporter({
    headers: authHeaders
  });

  const sdk = new opentelemetry.NodeSDK({
    traceExporter: otlpTraceExporter,
  });
  sdk.start();

  app.get('/rolldice', (req, res) => {
    const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
    if (isNaN(rolls)) {
      res
          .status(400)
          .send("Request parameter 'rolls' is missing or not a number.");
      return;
    }
    res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
  });

  app.listen(PORT, () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
  });
}

main();
