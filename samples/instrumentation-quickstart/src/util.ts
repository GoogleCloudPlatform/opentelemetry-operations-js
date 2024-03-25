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

import type {LoggerOptions} from 'pino';

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a random int in the range [low, high), assuming low and high are ints
 */
export function randInt(low: number, high: number): number {
  return Math.floor(Math.random() * (high - low) + low);
}

// [START opentelemetry_instrumentation_setup_logging]

// Expected attributes that OpenTelemetry adds to correlate logs with spans
interface LogRecord {
  trace_id?: string;
  span_id?: string;
  trace_flags?: string;
  [key: string]: unknown;
}

// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
const PinoLevelToSeverityLookup: Record<string, string | undefined> = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
};

export const loggerConfig = {
  messageKey: 'message',
  // Same as pino.stdTimeFunctions.isoTime but uses "timestamp" key instead of "time"
  timestamp(): string {
    return `,"timestamp":"${new Date(Date.now()).toISOString()}"`;
  },
  formatters: {
    log(object: LogRecord): Record<string, unknown> {
      // Add trace context attributes following Cloud Logging structured log format described
      // in https://cloud.google.com/logging/docs/structured-logging#special-payload-fields
      const {trace_id, span_id, trace_flags, ...rest} = object;

      return {
        'logging.googleapis.com/trace': trace_id,
        'logging.googleapis.com/spanId': span_id,
        'logging.googleapis.com/trace_sampled': trace_flags
          ? trace_flags === '01'
          : undefined,
        ...rest,
      };
    },
    // See
    // https://getpino.io/#/docs/help?id=mapping-pino-log-levels-to-google-cloud-logging-stackdriver-severity-levels
    level(label: string) {
      return {
        severity:
          PinoLevelToSeverityLookup[label] ?? PinoLevelToSeverityLookup['info'],
      };
    },
  },
} satisfies LoggerOptions;

// [END opentelemetry_instrumentation_setup_logging]
