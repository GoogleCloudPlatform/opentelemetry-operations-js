// Copyright 2021 Google LLC
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

import {status as Status} from '@grpc/grpc-js';
import {
  Tracer,
  BasicTracerProvider,
  BatchSpanProcessor,
} from '@opentelemetry/tracing';
import {AlwaysOnSampler} from '@opentelemetry/core';
import {Resource} from '@opentelemetry/resources';
import {TraceExporter} from '@google-cloud/opentelemetry-cloud-trace-exporter';
import * as constants from './constants';
import {context, SpanKind} from '@opentelemetry/api';
import {AsyncHooksContextManager} from '@opentelemetry/context-async-hooks';

export interface Request {
  testId: string;
  headers: {[key: string]: string};
  data: Buffer;
}

export interface Response {
  statusCode: Status;
  data?: Buffer;
}

context.setGlobalContextManager(new AsyncHooksContextManager());

async function withTracer<R>(f: (tracer: Tracer) => R): Promise<R> {
  const tracerProvider = new BasicTracerProvider({
    sampler: new AlwaysOnSampler(),
    resource: Resource.EMPTY,
  });
  tracerProvider.addSpanProcessor(
    new BatchSpanProcessor(new TraceExporter({projectId: constants.PROJECT_ID}))
  );

  try {
    return f(tracerProvider.getTracer(constants.INSTRUMENTING_MODULE_NAME));
  } finally {
    await tracerProvider.shutdown();
  }
}

async function health(): Promise<Response> {
  return {statusCode: Status.OK};
}

async function basicTrace(request: Request): Promise<Response> {
  return await withTracer(async (tracer: Tracer): Promise<Response> => {
    tracer
      .startSpan('basicTrace', {
        attributes: {[constants.TEST_ID]: request.testId},
      })
      .end();
    return {statusCode: Status.OK};
  });
}
async function complexTrace(request: Request): Promise<Response> {
  const attributes = {[constants.TEST_ID]: request.testId};
  return await withTracer(async (tracer: Tracer): Promise<Response> => {
    tracer.startActiveSpan('complexTrace/root', {attributes}, span => {
      tracer.startActiveSpan(
        'complexTrace/child1',
        {attributes, kind: SpanKind.SERVER},
        span => {
          tracer
            .startSpan('complexTrace/child2', {
              attributes,
              kind: SpanKind.CLIENT,
            })
            .end();
          span.end();
        }
      );
      tracer.startSpan('complexTrace/child3', {attributes}).end();
      span.end();
    });
    return {statusCode: Status.OK};
  });
}

async function notImplementedHandler(): Promise<Response> {
  return {statusCode: Status.UNIMPLEMENTED};
}

export type ScenarioHandler = (request: Request) => Promise<Response>;

const SCENARIO_TO_HANDLER: {[scenario: string]: ScenarioHandler} = {
  '/health': health,
  '/basicTrace': basicTrace,
  '/complexTrace': complexTrace,
} as const;

export function getScenarioHandler(scenario: string): ScenarioHandler {
  return SCENARIO_TO_HANDLER[scenario] ?? notImplementedHandler;
}
