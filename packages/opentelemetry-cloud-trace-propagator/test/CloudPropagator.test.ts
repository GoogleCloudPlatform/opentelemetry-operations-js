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

import { defaultSetter, SpanContext, TraceFlags } from '@opentelemetry/api';
import { Context } from '@opentelemetry/context-base';
import * as assert from 'assert';
import { setExtractedSpanContext } from '@opentelemetry/core';
import {
  CloudPropagator,
  TRACE_CONTEXT_HEADER_NAME,
} from '../src/CloudPropagator';

describe('CloudPropagator', () => {
  const cloudPropagator = new CloudPropagator();
  let carrier: { [key: string]: unknown };

  beforeEach(() => {
    carrier = {};
  });
  
  describe('.inject()', () => {
    it('should inject a context of a sampled span', () => {
      const spanContext: SpanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };

      cloudPropagator.inject(
        setExtractedSpanContext(Context.ROOT_CONTEXT, spanContext),
        carrier,
        defaultSetter
      );

      assert.deepStrictEqual(
        carrier[TRACE_CONTEXT_HEADER_NAME],
        'd4cda95b652f4a1592b449d5929fda1b/7929822056569588882;o=1'
      );
    });
    it('should inject a context of a unsampled span', () => {
      const spanContext: SpanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.NONE,
      };
      cloudPropagator.inject(
        setExtractedSpanContext(Context.ROOT_CONTEXT, spanContext),
        carrier,
        defaultSetter
      );
      assert.deepStrictEqual(
        carrier[TRACE_CONTEXT_HEADER_NAME],
        'd4cda95b652f4a1592b449d5929fda1b/7929822056569588882;o=0'
      );
    });
  });
});
