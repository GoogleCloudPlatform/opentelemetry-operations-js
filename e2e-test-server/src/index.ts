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

import * as express from 'express';
import {PubSub, Message as PubSubMessage} from '@google-cloud/pubsub';
import {Status} from '@grpc/grpc-js/build/src/constants';

import logger from './logger';
import * as constants from './constants';
import * as scenarios from './scenarios';
import {diag, DiagConsoleLogger, DiagLogLevel} from '@opentelemetry/api';

const pubsub = new PubSub({projectId: constants.PROJECT_ID});
const responseTopic = pubsub.topic(constants.RESPONSE_TOPIC_NAME, {
  batching: {maxMessages: 1},
});

/**
 * Subset of PubSubMessage to represent a message delivered either via push or pull in a single
 * interface
 */
type Message = Pick<PubSubMessage, 'ack' | 'nack' | 'attributes' | 'data'>;

/**
 * The incoming json payload from a push subscription, see
 * https://cloud.google.com/pubsub/docs/push#receive_push
 */
interface PubSubPushPayload {
  message: {
    attributes: PubSubMessage['attributes'];
    // Base64 encoded string of data
    data?: string;
  };
  subscription: string;
}

/**
 * Starts listening on the pubsub topic for requests
 */
function pubSubPull() {
  pubsub
    .subscription(constants.REQUEST_SUBSCRIPTION_NAME)
    .on('message', onRequestMessage)
    .on('error', error => {
      logger.error('Received error: %s', error);
    });
  logger.info(
    'Listening on subscription %s for pubsub message',
    constants.REQUEST_SUBSCRIPTION_NAME
  );
}

/**
 * Starts an HTTP server to receive pubsub push requests. This is used for serverless
 * environments where we can't subscribe via pull.
 */
function pubSubPush() {
  if (constants.PUSH_PORT === undefined) {
    throw new Error('PUSH_PORT must be set when in push subscription mode');
  }

  const app = express();

  app
    .use(express.json())
    .post('/', (req, res) => {
      logger.info('Received push subscription request');
      const payload: PubSubPushPayload = req.body;
      const data = Buffer.from(payload.message?.data ?? '', 'base64');
      const message: Message = {
        attributes: payload.message.attributes,
        data,
        ack() {
          res.sendStatus(200);
        },
        nack() {
          res.sendStatus(400);
        },
      };
      onRequestMessage(message).catch(error => {
        res.status(500).send(`${error}`);
      });
    })
    .listen(constants.PUSH_PORT, () => {
      logger.info(
        'Listening on port %s for pubsub push messages',
        constants.PUSH_PORT
      );
    });
}

async function onRequestMessage(message: Message): Promise<void> {
  const testId = message.attributes?.[constants.TEST_ID];
  if (testId === undefined) {
    // don't even know how to write back to the publisher that the message is
    // invalid, so nack()
    message.nack();
    return;
  }

  const scenario = message.attributes?.[constants.SCENARIO];
  if (scenario === undefined) {
    await respond(testId, {
      statusCode: Status.INVALID_ARGUMENT,
      data: Buffer.from(`Expected attribute ${constants.SCENARIO} is missing`),
    });
    return;
  }

  const handler = scenarios.getScenarioHandler(scenario);
  let res: scenarios.Response;
  try {
    res = await handler({
      data: message.data,
      headers: message.attributes,
      testId,
    });
  } catch (e) {
    logger.error('caught error from handler for scenario %s: %s', scenario, e);
    res = {
      statusCode: Status.INTERNAL,
      data: Buffer.from((e as Error | undefined)?.stack ?? String(e)),
    };
  } finally {
    if (res! === undefined) {
      res = {statusCode: Status.UNKNOWN};
    }
    await respond(testId, res);
    message.ack();
  }
}

async function respond(testId: string, res: scenarios.Response): Promise<void> {
  const {data = Buffer.alloc(0), headers = {}, statusCode} = res;
  logger.info(
    'Sending response on topic %s, status %s, data %s, headers %s',
    constants.RESPONSE_TOPIC_NAME,
    statusCode,
    data,
    headers
  );
  await responseTopic.publishMessage({
    data,
    attributes: {
      ...headers,
      [constants.TEST_ID]: testId,
      [constants.STATUS_CODE]: statusCode.toString(),
    },
  });
}

function main(): void {
  process.on('exit', () => {
    logger.info('Exiting nodejs process');
  });
  diag.setLogger(new DiagConsoleLogger(), {logLevel: DiagLogLevel.ALL});

  switch (constants.SUBSCRIPTION_MODE) {
    case constants.SubscriptionMode.PULL:
      logger.info('Starting PULL subscription listener');
      pubSubPull();
      return;
    case constants.SubscriptionMode.PUSH:
      pubSubPush();
      logger.info('Starting PUSH subscription http server');
      return;
    default:
      constants.SUBSCRIPTION_MODE as never;
      return;
  }
}

main();
