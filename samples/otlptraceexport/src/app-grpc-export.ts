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

import express, {Request, Response} from 'express';
import {rollTheDice} from './dice';

import {NodeSDK} from '@opentelemetry/sdk-node';
// [START opentelemetry_otlp_grpc_imports]
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-grpc';
// [END opentelemetry_otlp_grpc_imports]
// [START opentelemetry_otlp_grpc_auth_imports]
import {AuthClient, GoogleAuth} from 'google-auth-library';
import {credentials} from '@grpc/grpc-js';
// [END opentelemetry_otlp_grpc_auth_imports]

const PORT = parseInt(process.env.PORT || '8080');
const app = express();

// [START opentelemetry_otlp_grpc_auth_setup]
async function getAuthenticatedClient(): Promise<AuthClient> {
  const auth: GoogleAuth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });
  return await auth.getClient();
}

// Express App that exports traces via gRPC with protobuf
async function main() {
  const authenticatedClient: AuthClient = await getAuthenticatedClient();

  // [START_EXCLUDE]
  // [START opentelemetry_otlp_grpc_init]
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      credentials: credentials.combineChannelCredentials(
        credentials.createSsl(),
        credentials.createFromGoogleCredential(authenticatedClient),
      ),
    }),
  });
  sdk.start();
  // [END opentelemetry_otlp_grpc_init]

  app.get('/rolldice', (req: Request, res: Response) => {
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
  // [END_EXCLUDE]
}
// [END opentelemetry_otlp_grpc_auth_setup]
main().catch(console.error);
