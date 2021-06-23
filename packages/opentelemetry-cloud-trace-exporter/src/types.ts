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

import {Metadata} from '@grpc/grpc-js';

// extends cloudtrace_v2.Schema$Span

export interface Span {
  name?: string;
  spanId?: string;
  parentSpanId?: string;
  displayName?: TruncatableString;
  startTime?: Timestamp;
  endTime?: Timestamp;
  attributes?: Attributes;
  // This property is currently unused. keeping it here as it is part
  // of the stack driver trace types and may be used in the future
  stackTrace?: StackTrace;
  timeEvents?: TimeEvents;
  links?: Links;
  status?: Status;
  sameProcessAsParentSpan?: BoolValue;
  childSpanCount?: number;
  spanKind?: SpanKind;
}

export interface Timestamp {
  seconds: number;
  nanos: number;
}

export interface AttributeMap {
  [key: string]: AttributeValue;
}

export interface Attributes {
  attributeMap: AttributeMap;
  droppedAttributesCount?: number;
}

export interface AttributeValue {
  boolValue?: boolean;
  intValue?: string;
  stringValue?: TruncatableString;
}

export interface TruncatableString {
  value?: string;
  truncatedByteCount?: number;
}

export interface Links {
  droppedLinksCount?: number;
  link?: Link[];
}

export interface Link {
  attributes?: Attributes;
  spanId?: string;
  traceId?: string;
  type?: LinkType;
}

export interface StackTrace {
  stackFrames?: StackFrames;
  stackTraceHashId?: string;
}

export interface StackFrames {
  droppedFramesCount?: number;
  frame?: StackFrame[];
}

export interface StackFrame {
  columnNumber?: string;
  fileName?: TruncatableString;
  functionName?: TruncatableString;
  lineNumber?: string;
  loadModule?: Module;
  originalFunctionName?: TruncatableString;
  sourceVersion?: TruncatableString;
}

export interface Module {
  buildId?: TruncatableString;
  module?: TruncatableString;
}

export interface Status {
  /** gRPC status code */
  code?: Code;
  message?: string;
}

export interface TimeEvents {
  droppedAnnotationsCount?: number;
  droppedMessageEventsCount?: number;
  timeEvent?: TimeEvent[];
}

export interface TimeEvent {
  annotation?: Annotation;
  time?: Timestamp;
  // This property is currently unused. keeping it here as it is part
  // of the stack driver trace types and may be used in the future
  messageEvent?: MessageEvent;
}

export interface Annotation {
  attributes?: Attributes;
  description?: TruncatableString;
}

export interface MessageEvent {
  id?: string;
  type?: Type;
  compressedSizeBytes?: string;
  uncompressedSizeBytes?: string;
}

export enum Type {
  TYPE_UNSPECIFIED = 0,
  SENT = 1,
  RECEIVED = 2,
}

export enum LinkType {
  UNSPECIFIED = 0,
  CHILD_LINKED_SPAN = 1,
  PARENT_LINKED_SPAN = 2,
}

/**
 * A protobuf boolean
 */
export interface BoolValue {
  value: boolean;
}

export interface NamedSpans {
  name: string;
  spans: Span[];
}

export interface TraceService {
  BatchWriteSpans: (
    call: NamedSpans,
    metadata: Metadata,
    callback: Function
  ) => void;
}

/**
 * A google.rpc.Code
 */
export enum Code {
  // These are the only two we care about mapping to
  OK = 0,
  UNKNOWN = 2,
}

/**
 * See https://github.com/googleapis/googleapis/blob/master/google/devtools/cloudtrace/v2/trace.proto#L182
 */
export enum SpanKind {
  // Unspecified. Do NOT use as default.
  // Implementations MAY assume SpanKind.INTERNAL to be default.
  SPAN_KIND_UNSPECIFIED = 0,

  // Indicates that the span is used internally. Default value.
  INTERNAL = 1,

  // Indicates that the span covers server-side handling of an RPC or other
  // remote network request.
  SERVER = 2,

  // Indicates that the span covers the client-side wrapper around an RPC or
  // other remote request.
  CLIENT = 3,

  // Indicates that the span describes producer sending a message to a broker.
  // Unlike client and  server, there is no direct critical path latency
  // relationship between producer and consumer spans (e.g. publishing a
  // message to a pubsub service).
  PRODUCER = 4,

  // Indicates that the span describes consumer receiving a message from a
  // broker. Unlike client and  server, there is no direct critical path
  // latency relationship between producer and consumer spans (e.g. receiving
  // a message from a pubsub service subscription).
  CONSUMER = 5,
}
