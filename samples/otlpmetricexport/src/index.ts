// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as opentelemetry from '@opentelemetry/sdk-node';
import {AuthClient, GoogleAuth} from 'google-auth-library';
import {credentials} from '@grpc/grpc-js';
import {getResourceDetectors as getResourceDetectorsFromEnv} from '@opentelemetry/auto-instrumentations-node';
import {metrics, diag, DiagConsoleLogger} from '@opentelemetry/api';
import {OTLPMetricExporter} from '@opentelemetry/exporter-metrics-otlp-grpc';
import {PeriodicExportingMetricReader} from '@opentelemetry/sdk-metrics';

async function getAuthenticatedClient(): Promise<AuthClient> {
  const auth: GoogleAuth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });
  return await auth.getClient();
}

diag.setLogger(
  new DiagConsoleLogger(),
  opentelemetry.core.diagLogLevelFromString(
    opentelemetry.core.getStringFromEnv('OTEL_LOG_LEVEL'),
  ),
);

// App that exports metrics via gRPC with protobuf
async function main() {
  const authenticatedClient: AuthClient = await getAuthenticatedClient();

  const sdk = new opentelemetry.NodeSDK({
    metricReader: new PeriodicExportingMetricReader({
      // Export metrics every 10 seconds. 5 seconds is the smallest sample period allowed by
      // Cloud Monitoring.
      exportIntervalMillis: 10_000,
      exporter: new OTLPMetricExporter({
        credentials: credentials.combineChannelCredentials(
          credentials.createSsl(),
          credentials.createFromGoogleCredential(authenticatedClient),
        ),
      }),
    }),
    resourceDetectors: getResourceDetectorsFromEnv(),
  });
  sdk.start();

  // Create a meter
  const meter = metrics.getMeter('metrics-sample');

  // Create a counter instrument
  const counter = meter.createCounter('metric_name');
  // Record a measurement
  counter.add(10, {key: 'value'});

  // Wait for the metric to be exported
  await new Promise(resolve => {
    setTimeout(resolve, 11_000);
  });

  // Gracefully shut down the SDK to flush telemetry when the program exits
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => diag.debug('OpenTelemetry SDK terminated'))
      .catch(error => diag.error('Error terminating OpenTelemetry SDK', error));
  });
}

main().catch(console.error);
