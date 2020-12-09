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
  defaultTextMapGetter,
  defaultTextMapSetter,
  getActiveSpan,
  ROOT_CONTEXT,
  setExtractedSpanContext,
  SpanContext,
  TraceFlags,
} from '@opentelemetry/api';
import * as assert from 'assert';
import {CloudPropagator, X_CLOUD_TRACE_HEADER} from '../src/CloudPropagator';

describe('CloudPropagator', () => {
  const cloudPropagator = new CloudPropagator();
  let carrier: {[key: string]: unknown};

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
        setExtractedSpanContext(ROOT_CONTEXT, spanContext),
        carrier,
        defaultTextMapSetter
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
        setExtractedSpanContext(ROOT_CONTEXT, spanContext),
        carrier,
        defaultTextMapSetter
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
      const extractedSpanContext = getActiveSpan(
        cloudPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      )?.context();

      assert.deepStrictEqual(extractedSpanContext, {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
        isRemote: true,
      });
    });

    it('should extract context of a unsampled span from carrier', () => {
      carrier[X_CLOUD_TRACE_HEADER] =
        'd4cda95b652f4a1592b449d5929fda1b/7929822056569588882;o=0';
      const extractedSpanContext = getActiveSpan(
        cloudPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      )?.context();

      assert.deepStrictEqual(extractedSpanContext, {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.NONE,
        isRemote: true,
      });
    });

    it('should handle trace_flags other than 0 and 1', () => {
      carrier[X_CLOUD_TRACE_HEADER] =
        'd4cda95b652f4a1592b449d5929fda1b/7929822056569588882;o=123';
      const extractedSpanContext = getActiveSpan(
        cloudPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      )?.context();

      assert.deepStrictEqual(extractedSpanContext, {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
        isRemote: true,
      });
    });

    it('should handle missing trace_flags', () => {
      carrier[X_CLOUD_TRACE_HEADER] =
        'b75dc0042a82efcb6b0a194911272926/1258215';
      const extractedSpanContext = getActiveSpan(
        cloudPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      )?.context();

      assert.deepStrictEqual(
        extractedSpanContext!.traceId,
        'b75dc0042a82efcb6b0a194911272926'
      );
      assert.deepStrictEqual(extractedSpanContext!.spanId, '00000000001332e7');
      assert.deepStrictEqual(extractedSpanContext!.traceFlags, TraceFlags.NONE);
    });

    it('should extract x-cloud-trace-context from list of header', () => {
      carrier[X_CLOUD_TRACE_HEADER] = [
        'd4cda95b652f4a1592b449d5929fda1b/7929822056569588882;o=1',
      ];
      const extractedSpanContext = getActiveSpan(
        cloudPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      )?.context();
      assert.deepStrictEqual(extractedSpanContext, {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
        isRemote: true,
      });
    });

    it('returns undefined if x-cloud-trace-context header is missing', () => {
      assert.deepStrictEqual(
        getActiveSpan(
          cloudPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )?.context(),
        undefined
      );
    });

    it('should gracefully handle an invalid x-cloud-trace-context header', () => {
      // A set of test cases with different invalid combinations of a
      // x-cloud-trace-context header. These should all result in a `undefined`
      // SpanContext value being extracted.

      const testCases: Record<string, string> = {
        invalid_header_value: 'invalid!',
        invalid_span_id:
          'd4cda95b652f4a1592b449d5929fda1b/foo7929822056569588882bar;o=1',
        too_long_id:
          '111111111111111111111111111111111111111111111/7929822056569588882;o=1',
        too_short_id: '1111111111111/7929822056569588882;o=1',
        missing_trace_id: '/7929822056569588882;o=1',
        invalid_flag: 'o=1',
        invalid_trace_id_all_zeros:
          '00000000000000000000000000000000/7929822056569588882;o=1',
        invalid_span_id_all_zeros:
          'd4cda95b652f4a1592b449d5929fda1b/0000000000000000;o=1',
      };

      for (const [testName, testData] of Object.entries(testCases)) {
        carrier[X_CLOUD_TRACE_HEADER] = testData;

        const extractedSpanContext = getActiveSpan(
          cloudPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )?.context();

        assert.deepStrictEqual(extractedSpanContext, undefined, testName);
      }
    });
  });

  describe('.fields()', () => {
    it('Return only the single "x-cloud-trace-context" header is used', () => {
      assert.deepStrictEqual(cloudPropagator.fields(), [X_CLOUD_TRACE_HEADER]);
    });

    it('Return the same copy each time', () => {
      assert.strictEqual(cloudPropagator.fields(), cloudPropagator.fields());
    });
  });
});
