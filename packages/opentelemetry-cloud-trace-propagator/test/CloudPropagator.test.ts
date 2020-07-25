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
  defaultSetter,
  defaultGetter,
  SpanContext,
  TraceFlags,
} from '@opentelemetry/api';
import { Context } from '@opentelemetry/context-base';
import * as assert from 'assert';
import {
  setExtractedSpanContext,
  getExtractedSpanContext,
} from '@opentelemetry/core';
import { CloudPropagator, X_CLOUD_TRACE_HEADER } from '../src/CloudPropagator';

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
        carrier[X_CLOUD_TRACE_HEADER],
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
        carrier[X_CLOUD_TRACE_HEADER],
        'd4cda95b652f4a1592b449d5929fda1b/7929822056569588882;o=0'
      );
    });
  });

  describe('.extract()', () => {
    it('should extract context of a sampled span from carrier', () => {
      carrier[X_CLOUD_TRACE_HEADER] =
        'd4cda95b652f4a1592b449d5929fda1b/7929822056569588882;o=1';
      const extractedSpanContext = getExtractedSpanContext(
        cloudPropagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should extract context of a unsampled span from carrier', () => {
      carrier[X_CLOUD_TRACE_HEADER] =
        'd4cda95b652f4a1592b449d5929fda1b/7929822056569588882;o=0';
      const extractedSpanContext = getExtractedSpanContext(
        cloudPropagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.NONE,
      });
    });

    it('should extract specified traceId and auto-generated spanId.', () => {
      carrier[X_CLOUD_TRACE_HEADER] = 'b75dc0042a82efcb6b0a194911272926';
      const extractedSpanContext = getExtractedSpanContext(
        cloudPropagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );

      assert.deepStrictEqual(
        extractedSpanContext.traceId,
        'b75dc0042a82efcb6b0a194911272926'
      );
      assert.deepStrictEqual(extractedSpanContext.traceFlags, TraceFlags.NONE);
    });

    it('should handle missing trace_flags', () => {
      carrier[X_CLOUD_TRACE_HEADER] =
        'b75dc0042a82efcb6b0a194911272926/1258215';
      const extractedSpanContext = getExtractedSpanContext(
        cloudPropagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );

      assert.deepStrictEqual(
        extractedSpanContext.traceId,
        'b75dc0042a82efcb6b0a194911272926'
      );
      assert.deepStrictEqual(extractedSpanContext.spanId, '00000000001332e7');
      assert.deepStrictEqual(extractedSpanContext.traceFlags, TraceFlags.NONE);
    });

    it('should extract x-cloud-trace-context from list of header', () => {
      carrier[X_CLOUD_TRACE_HEADER] = [
        'd4cda95b652f4a1592b449d5929fda1b/7929822056569588882;o=1',
      ];
      const extractedSpanContext = getExtractedSpanContext(
        cloudPropagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );
      assert.deepStrictEqual(extractedSpanContext, {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('returns undefined if x-cloud-trace-context header is missing', () => {
      assert.deepStrictEqual(
        getExtractedSpanContext(
          cloudPropagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
        ),
        undefined
      );
    });

    it('returns undefined if x-cloud-trace-context header is invalid', () => {
      carrier[X_CLOUD_TRACE_HEADER] = 'invalid!';
      assert.deepStrictEqual(
        getExtractedSpanContext(
          cloudPropagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
        ),
        undefined
      );
    });

    it('should gracefully handle an invalid x-cloud-trace-context header', () => {
      // A set of test cases with different invalid combinations of a
      // x-cloud-trace-context header. These should all result in a `undefined`
      // SpanContext value being extracted.

      const testCases: Record<string, string> = {
        invalid1: 'd4cda95b652f4a1592b449d5929fda1b/7929822056569588882foo',
        invalid2: 'd4cda95b652f4a1592b449d5929fda1b/7929822056569588882;o=0foo',
      };

      for (const [testName, testData] of Object.entries(testCases)) {
        carrier[X_CLOUD_TRACE_HEADER] = testData;

        const extractedSpanContext = getExtractedSpanContext(
          cloudPropagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
        );

        assert.deepStrictEqual(extractedSpanContext, {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
        });
      }
    });
  });
});
