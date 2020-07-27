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
  HttpTextPropagator,
  Context,
  SetterFunction,
  GetterFunction,
  TraceFlags,
} from '@opentelemetry/api';
import { decToHex, hexToDec } from 'hex2dec';
import {
  setExtractedSpanContext,
  getParentSpanContext,
} from '@opentelemetry/core';
import * as crypto from 'crypto';

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
 *  {SPAN_ID} is the decimal representation of the (unsigned) span ID. It
 *    should be 0 for the first span in your trace. For subsequent requests,
 *    set SPAN_ID to the span ID of the parent request.
 *  {TRACE_TRUE} must be 1 to trace request. Specify 0 to not trace the request.
 */

/** Header that carries span context across Google infrastructure. */
export const X_CLOUD_TRACE_HEADER = 'x-cloud-trace-context';
const TRACE_ID_REGEX = /^([0-9a-f]{32})/;
const SPAN_ID_REGEX = /\/(\d+)/;
const TRACE_TRUE_SUFFIX_REGEX = /o=([01])$/;
const SPAN_ID_BYTES = 8;

export class CloudPropagator implements HttpTextPropagator {
  inject(context: Context, carrier: unknown, setter: SetterFunction): void {
    const spanContext = getParentSpanContext(context);
    if (!spanContext) return;

    const header = `${spanContext.traceId}/${hexToDec(
      spanContext.spanId
    )};o=${spanContext.traceFlags & TraceFlags.SAMPLED}`;

    setter(carrier, X_CLOUD_TRACE_HEADER, header);
  }

  extract(context: Context, carrier: unknown, getter: GetterFunction): Context {
    const traceContextHeader = getter(carrier, X_CLOUD_TRACE_HEADER);
    const traceContextHeaderValue = Array.isArray(traceContextHeader)
      ? traceContextHeader[0]
      : traceContextHeader;
    if (typeof traceContextHeaderValue !== 'string') {
      return context;
    }

    const spanContext = {
      traceId: '',
      spanId: crypto.randomBytes(SPAN_ID_BYTES).toString('hex'),
      traceFlags: TraceFlags.NONE,
      isRemote: true,
    };

    let match;
    match = traceContextHeaderValue.match(TRACE_ID_REGEX);
    if (match && match[1] !== '00000000000000000000000000000000') {
      spanContext.traceId = match[1];
    } else {
      return context;
    }
    match = traceContextHeaderValue.match(SPAN_ID_REGEX);
    if (match && match[1] !== '0000000000000000') {
      spanContext.spanId = decToHex(match[1], { prefix: false }).padStart(
        16,
        '0'
      );
    }

    match = traceContextHeaderValue.match(TRACE_TRUE_SUFFIX_REGEX);
    if (match) {
      spanContext.traceFlags =
        match[1] === '1' ? TraceFlags.SAMPLED : TraceFlags.NONE;
    }

    return setExtractedSpanContext(context, spanContext);
  }
}
