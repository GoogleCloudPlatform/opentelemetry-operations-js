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

export interface Request {
  testId: string;
  headers: {[key: string]: string};
  data: Buffer;
}

export interface Response {
  statusCode: Status;
  data?: Buffer;
}

async function health(): Promise<Response> {
  return {statusCode: Status.OK};
}

async function notImplementedHandler(): Promise<Response> {
  return {statusCode: Status.UNIMPLEMENTED};
}

export type ScenarioHandler = (request: Request) => Promise<Response>;

const SCENARIO_TO_HANDLER: {[scenario: string]: ScenarioHandler} = {
  '/health': health,
} as const;

export function getScenarioHandler(scenario: string): ScenarioHandler {
  return SCENARIO_TO_HANDLER[scenario] ?? notImplementedHandler;
}
