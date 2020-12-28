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

import * as ot from '@opentelemetry/api';
import {VERSION as CORE_VERSION} from '@opentelemetry/core';
import {Resource} from '@opentelemetry/resources';
import {ReadableSpan} from '@opentelemetry/tracing';
import {
  AttributeMap,
  Attributes,
  AttributeValue,
  Link,
  LinkType,
  Span,
  Timestamp,
  TruncatableString,
} from './types';
import {VERSION} from './version';

const AGENT_LABEL_KEY = 'g.co/agent';
const AGENT_LABEL_VALUE = `opentelemetry-js ${CORE_VERSION}; google-cloud-trace-exporter ${VERSION}`;

export function getReadableSpanTransformer(
  projectId: string
): (span: ReadableSpan) => Span {
  return span => {
    const attributes = transformAttributes(
      span.attributes,
      {
        project_id: projectId,
        [AGENT_LABEL_KEY]: AGENT_LABEL_VALUE,
      },
      span.resource
    );

    const out: Span = {
      attributes,
      displayName: stringToTruncatableString(span.name),
      links: {
        link: span.links.map(transformLink),
      },
      endTime: transformTime(span.endTime),
      startTime: transformTime(span.startTime),
      name: `projects/${projectId}/traces/${span.spanContext.traceId}/spans/${span.spanContext.spanId}`,
      spanId: span.spanContext.spanId,
      sameProcessAsParentSpan: {value: !span.spanContext.isRemote},
      status: span.status,
      timeEvents: {
        timeEvent: span.events.map(e => ({
          time: transformTime(e.time),
          annotation: {
            attributes: transformAttributes(e.attributes),
            description: stringToTruncatableString(e.name),
          },
        })),
      },
    };

    if (span.parentSpanId) {
      out.parentSpanId = span.parentSpanId;
    }

    return out;
  };
}

function transformTime(time: ot.HrTime): Timestamp {
  return {
    seconds: time[0],
    nanos: time[1],
  };
}

function transformLink(link: ot.Link): Link {
  return {
    attributes: transformAttributes(link.attributes),
    spanId: link.context.spanId,
    traceId: link.context.traceId,
    type: LinkType.UNSPECIFIED,
  };
}

function transformAttributes(
  requestAttributes: ot.Attributes = {},
  serviceAttributes: ot.Attributes = {},
  resource: Resource = Resource.empty()
): Attributes {
  const attributes = Object.assign(
    {},
    requestAttributes,
    serviceAttributes,
    resource.attributes
  );
  const changedAttributes = transformAttributeNames(attributes);
  const attributeMap = transformAttributeValues(changedAttributes);
  return {
    attributeMap,
    // @todo get dropped attribute count from sdk ReadableSpan
    droppedAttributesCount:
      Object.keys(attributes).length - Object.keys(attributeMap).length,
  };
}

function transformAttributeValues(attributes: ot.Attributes): AttributeMap {
  const out: AttributeMap = {};
  for (const [key, value] of Object.entries(attributes)) {
    switch (typeof value) {
      case 'number':
      case 'boolean':
      case 'string':
        out[key] = valueToAttributeValue(value);
        break;
      default:
        break;
    }
  }
  return out;
}

function stringToTruncatableString(value: string): TruncatableString {
  return {value};
}

function valueToAttributeValue(
  value: string | number | boolean
): AttributeValue {
  switch (typeof value) {
    case 'number':
      // TODO: Consider to change to doubleValue when available in V2 API.
      return {intValue: String(Math.round(value))};
    case 'boolean':
      return {boolValue: value};
    case 'string':
      return {stringValue: stringToTruncatableString(value)};
    default:
      return {};
  }
}

const HTTP_ATTRIBUTE_MAPPING: {[key: string]: string} = {
  'http.method': '/http/method',
  'http.url': '/http/url',
  'http.host': '/http/host',
  'http.scheme': '/http/client_protocol',
  'http.status_code': '/http/status_code',
  'http.user_agent': '/http/user_agent',
  'http.request_content_length': '/http/request/size',
  'http.response_content_length': '/http/response/size',
  'http.route': '/http/route',
};
function transformAttributeNames(attributes: ot.Attributes): ot.Attributes {
  const out: ot.Attributes = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (HTTP_ATTRIBUTE_MAPPING[key]) {
      out[HTTP_ATTRIBUTE_MAPPING[key]] = value;
    } else {
      out[key] = value;
    }
  }
  return out;
}
