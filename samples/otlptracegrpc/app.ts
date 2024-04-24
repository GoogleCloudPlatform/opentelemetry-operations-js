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

/*app.ts*/
import { trace, diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import express, { Express, Request, Response } from 'express';
import { rollTheDice } from './dice';

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { AuthClient, GoogleAuth } from 'google-auth-library';
import { credentials } from '@grpc/grpc-js';

const tracer = trace.getTracer('dice-server', '0.1.0');

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

async function main() {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  async function getAuthenticatedClient(): Promise<AuthClient> {  
    const auth: GoogleAuth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });
    const client: AuthClient = await auth.getClient();
    return client;    
  }
  const authenticatedClient: AuthClient = await getAuthenticatedClient();

  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      credentials: credentials.combineChannelCredentials(credentials.createSsl(), credentials.createFromGoogleCredential(authenticatedClient)),
    }),
  });
  sdk.start();

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
}

main();
