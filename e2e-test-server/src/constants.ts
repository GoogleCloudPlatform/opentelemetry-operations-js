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

import 'process';

export enum SubscriptionMode {
  PULL = 'pull',
  PUSH = 'push',
}

function envOrThrow(key: string): string {
  const val = process.env[key];
  if (val === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return val;
}

export const INSTRUMENTING_MODULE_NAME = 'opentelemetry-ops-e2e-test-server';
export const SCENARIO = 'scenario';
export const STATUS_CODE = 'status_code';
export const TEST_ID = 'test_id';

let subscriptionMode;
switch (envOrThrow('SUBSCRIPTION_MODE')) {
  case SubscriptionMode.PULL:
    subscriptionMode = SubscriptionMode.PULL;
    break;
  case SubscriptionMode.PUSH:
    subscriptionMode = SubscriptionMode.PUSH;
    break;
  default:
    throw new Error(
      `SUBSCRIPTION_MODE must be ${SubscriptionMode.PUSH} or ${SubscriptionMode.PULL}`
    );
}

export const SUBSCRIPTION_MODE: SubscriptionMode = subscriptionMode;
export const PROJECT_ID = envOrThrow('PROJECT_ID');
export const REQUEST_SUBSCRIPTION_NAME = envOrThrow(
  'REQUEST_SUBSCRIPTION_NAME'
);
export const RESPONSE_TOPIC_NAME = envOrThrow('RESPONSE_TOPIC_NAME');
