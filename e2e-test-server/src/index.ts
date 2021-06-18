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

import {PubSub, Message} from '@google-cloud/pubsub';
import {Status} from '@grpc/grpc-js/build/src/constants';
import logger from './logger';
import * as constants from './constants';
import * as scenarios from './scenarios';

async function pubSubPull(): Promise<void> {
  const pubsub = new PubSub({projectId: constants.PROJECT_ID});
  const responseTopic = await pubsub.topic(constants.RESPONSE_TOPIC_NAME, {
    batching: {maxMessages: 1},
  });

  async function respond(
    testId: string,
    res: scenarios.Response
  ): Promise<void> {
    const {data = Buffer.alloc(0), statusCode} = res;
    logger.info(
      'Sending response on topic %s, status %s, data %s',
      constants.RESPONSE_TOPIC_NAME,
      statusCode,
      data
    );
    responseTopic.publish(data, {
      [constants.TEST_ID]: testId,
      [constants.STATUS_CODE]: statusCode.toString(),
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
      respond(testId, {
        statusCode: Status.INVALID_ARGUMENT,
        data: Buffer.from(
          `Expected attribute ${constants.SCENARIO} is missing`
        ),
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
      logger.error(
        'caught error from handler for scenario %s: %s',
        scenario,
        e
      );
      res = {
        statusCode: Status.INTERNAL,
        data: Buffer.from(e?.stack ?? String(e)),
      };
    } finally {
      if (res! === undefined) {
        res = {statusCode: Status.UNKNOWN};
      }
      respond(testId, res);
      message.ack();
    }
  }

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

async function main(): Promise<void> {
  switch (constants.SUBSCRIPTION_MODE) {
    case constants.SubscriptionMode.PULL:
      return await pubSubPull();
    case constants.SubscriptionMode.PUSH:
      throw new Error('Pubsub push mode is not yet implemented');
  }
}

main().catch(logger.error);
