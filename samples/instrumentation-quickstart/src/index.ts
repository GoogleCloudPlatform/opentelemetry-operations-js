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

import axios from 'axios';
import Fastify from 'fastify';
import {loggerConfig, randInt, sleep} from './util';

const port = 8080;

// [START opentelemetry_instrumentation_create_app]
// Create the Fastify app providing the Pino logger config
const fastify = Fastify({
  logger: loggerConfig,
});
// [END opentelemetry_instrumentation_create_app]

// [START opentelemetry_instrumentation_handle_single]
/**
 * handleSingle handles an http request by sleeping for 100-200 ms. It writes the number of
 * milliseconds slept as its response.
 */
fastify.get('/single', async request => {
  // Sleep between 100-200 milliseconds
  const sleepMillis = randInt(100, 200);
  request.log.info({sleepMillis}, 'Going to sleep');
  await sleep(sleepMillis);
  return `slept ${sleepMillis}\n`;
});
// [END opentelemetry_instrumentation_handle_single]

// [START opentelemetry_instrumentation_handle_multi]
/**
 * handleMulti handles an http request by making 3-7 http requests to the /single endpoint.
 *
 * OpenTelemetry instrumentation requires no changes here. It will automatically generate a
 * span for the controller body.
 */
fastify.get('/multi', async request => {
  const subRequests = randInt(3, 8);
  request.log.info({subRequests}, 'handle /multi request', subRequests);

  for (let i = 0; i < subRequests; i++) {
    await axios.get(`http://localhost:${port}/single`);
  }
  return 'ok';
});
// [END opentelemetry_instrumentation_handle_multi]

async function main() {
  try {
    await fastify.listen({port, host: '0.0.0.0'});
  } catch (err) {
    fastify.log.error(err);
    throw err;
  }
}

main();
