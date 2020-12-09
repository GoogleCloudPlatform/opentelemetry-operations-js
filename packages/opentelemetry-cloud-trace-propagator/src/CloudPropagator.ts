// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  TextMapPropagator,
  Context,
  TraceFlags,
  setExtractedSpanContext,
  getParentSpanContext,
  TextMapSetter,
  TextMapGetter,
} from '@opentelemetry/api';
import {decToHex, hexToDec} from 'hex2dec';

/**
 * This file implements propagation for the Stackdriver Trace v1 Trace Context
 * format.
 *
 * The header specification is:
 * "X-Cloud-Trace-Context: TRACE_ID/SPAN_ID;o=TRACE_TRUE"
 * Where:
 *  {TRACE_ID} is a 32-character hexadecimal value representing a 128-bit
 *    number. It should be unique between your requests, unless you
 *    intentionally want to bundle the requests together.
 *  {SPAN_ID} is the decimal representation of the (unsigned) span ID.
 *    It should be randomly generated and unique in your trace. For subsequent requests,
 *    set SPAN_ID to the span ID of the parent request.
 *  {TRACE_TRUE} must be 1 to trace request. Specify 0 to not trace the request.
 */

/** Header that carries span context across Google infrastructure. */
export const X_CLOUD_TRACE_HEADER = 'x-cloud-trace-context';
const FIELDS = [X_CLOUD_TRACE_HEADER];

export class CloudPropagator implements TextMapPropagator {
  inject(
    context: Context,
    carrier: unknown,
    setter: TextMapSetter<unknown>
  ): void {
    const spanContext = getParentSpanContext(context);
    if (!spanContext) return;

    const header = `${spanContext.traceId}/${hexToDec(spanContext.spanId)};o=${
      spanContext.traceFlags & TraceFlags.SAMPLED
    }`;

    setter.set(carrier, X_CLOUD_TRACE_HEADER, header);
  }

  extract(
    context: Context,
    carrier: unknown,
    getter: TextMapGetter<unknown>
  ): Context {
    const traceContextHeader = getter.get(carrier, X_CLOUD_TRACE_HEADER);
    const traceContextHeaderValue = Array.isArray(traceContextHeader)
      ? traceContextHeader[0]
      : traceContextHeader;
    if (typeof traceContextHeaderValue !== 'string') {
      return context;
    }
    const matches = traceContextHeaderValue.match(
      /^([0-9a-fA-F]{32})(?:\/([0-9]+))(?:;o=(.*))?/
    );

    if (
      !matches ||
      matches[1] === '00000000000000000000000000000000' ||
      matches[2] === '0000000000000000'
    ) {
      return context;
    }

    const spanContext = {
      traceId: matches[1],
      spanId: decToHex(matches[2], {prefix: false}).padStart(16, '0'),
      traceFlags:
        isNaN(Number(matches[3])) || matches[3] === '0'
          ? TraceFlags.NONE
          : TraceFlags.SAMPLED,
      isRemote: true,
    };

    return setExtractedSpanContext(context, spanContext);
  }

  fields(): string[] {
    return FIELDS;
  }
}
