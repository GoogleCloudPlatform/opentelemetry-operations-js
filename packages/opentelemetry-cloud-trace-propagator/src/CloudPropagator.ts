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

import {  HttpTextPropagator, Context, SetterFunction, GetterFunction,TraceFlags} from '@opentelemetry/api';
import { decToHex,hexToDec } from 'hex2dec';
import {  setExtractedSpanContext, getParentSpanContext } from '@opentelemetry/core';

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
 *    should be 0 for the fir
 */
/** Header that carries span context across Google infrastructure. */
export const TRACE_CONTEXT_HEADER_NAME = 'x-cloud-trace-context';

export class CloudPropagator implements HttpTextPropagator {
    inject(context: Context, carrier: unknown, setter: SetterFunction): void {
      const spanContext = getParentSpanContext(context);
      if (!spanContext) return;
  
      const header = `${spanContext.traceId}/${hexToDec(
        spanContext.spanId
      )};o=${spanContext.traceFlags || TraceFlags.NONE}`;
  
      setter(carrier, TRACE_CONTEXT_HEADER_NAME, header);
    }
    extract(context: Context, carrier: unknown, getter: GetterFunction): Context {
        const traceContextHeader = getter(carrier, TRACE_CONTEXT_HEADER_NAME);
        const traceContextHeaderValue = Array.isArray(traceContextHeader)
      ? traceContextHeader[0]
      : traceContextHeader;
if (typeof traceContextHeaderValue !== 'string') {
      return context;
    }
    const matches = traceContextHeaderValue.match(
        /^([0-9a-fA-F]+)(?:\/([0-9]+))(?:;o=(.*))?/
      );
      if (
        !matches ||
        matches.length !== 4 ||
        matches[0] !== traceContextHeader ||
        (matches[2] && isNaN(Number(matches[2])))
      ) {
        return context;
      }
      const spanContext= {
        traceId: matches[1],
        // strip 0x prefix from hex output from decToHex, and and pad so it's
        // always a length-16 hex string
        spanId: `0000000000000000${decToHex(matches[2]).slice(2)}`.slice(-16),
        traceFlags: parseInt(matches[3], 16),
      };
      return setExtractedSpanContext(context, spanContext);
    }
}