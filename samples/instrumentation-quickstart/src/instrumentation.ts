// Copyright The OpenTelemetry Authors
// Copyright 2024 Google LLC
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

/**
 * This file is adapted from
 * https://github.com/open-telemetry/opentelemetry-js-contrib/blob/9df30ea0fd822a69203b818b8fbe34e1e1c8bced/metapackages/auto-instrumentations-node/src/register.ts
 * and only needed until https://github.com/open-telemetry/opentelemetry-js/issues/4551 is
 * fixed. Then we can move to `--require @opentelemetry/auto-instrumentations-node/register`
 */

import * as opentelemetry from '@opentelemetry/sdk-node';
import {diag, DiagConsoleLogger} from '@opentelemetry/api';
import {
  getNodeAutoInstrumentations,
  getResourceDetectors as getResourceDetectorsFromEnv,
} from '@opentelemetry/auto-instrumentations-node';
import {
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import {OTLPMetricExporter} from '@opentelemetry/exporter-metrics-otlp-proto';

function getMetricReader() {
  // Can be removed after https://github.com/open-telemetry/opentelemetry-js/issues/4562
  const exportIntervalMillis = process.env.OTEL_METRIC_EXPORT_INTERVAL
    ? Number.parseFloat(process.env.OTEL_METRIC_EXPORT_INTERVAL)
    : undefined;
  const readerOptions = {
    exportIntervalMillis,
  };

  switch (process.env.OTEL_METRICS_EXPORTER) {
    case undefined:
    case '':
    case 'otlp':
      diag.info('using otel metrics exporter');
      return new PeriodicExportingMetricReader({
        ...readerOptions,
        exporter: new OTLPMetricExporter(),
      });
    case 'console':
      return new PeriodicExportingMetricReader({
        ...readerOptions,
        exporter: new ConsoleMetricExporter(),
      });
    case 'none':
      diag.info('disabling metrics reader');
      return undefined;
    default:
      throw Error(
        `no valid option for OTEL_METRICS_EXPORTER: ${process.env.OTEL_METRICS_EXPORTER}`
      );
  }
}

// [START opentelemetry_instrumentation_setup_opentelemetry]

diag.setLogger(
  new DiagConsoleLogger(),
  opentelemetry.core.getEnv().OTEL_LOG_LEVEL
);

const sdk = new opentelemetry.NodeSDK({
  instrumentations: getNodeAutoInstrumentations({
    // Disable noisy instrumentations
    '@opentelemetry/instrumentation-fs': {enabled: false},
  }),
  resourceDetectors: getResourceDetectorsFromEnv(),
  metricReader: getMetricReader(),
});

try {
  sdk.start();
  diag.info('OpenTelemetry automatic instrumentation started successfully');
} catch (error) {
  diag.error(
    'Error initializing OpenTelemetry SDK. Your application is not instrumented and will not produce telemetry',
    error
  );
}

// Gracefully shut down the SDK to flush telemetry when the program exits
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => diag.debug('OpenTelemetry SDK terminated'))
    .catch(error => diag.error('Error terminating OpenTelemetry SDK', error));
});

// [END opentelemetry_instrumentation_setup_opentelemetry]
