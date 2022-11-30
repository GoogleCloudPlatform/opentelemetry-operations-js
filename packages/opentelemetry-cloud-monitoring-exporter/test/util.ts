// Copyright 2022 Google LLC
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

import {
  MeterProvider,
  MeterProviderOptions,
  MetricReader,
  ResourceMetrics,
} from '@opentelemetry/sdk-metrics';
import {Attributes, Meter} from '@opentelemetry/api';

import {Resource} from '@opentelemetry/resources';

class InMemoryMetricReader extends MetricReader {
  protected async onShutdown(): Promise<void> {}
  protected async onForceFlush(): Promise<void> {}
}

export async function generateMetricsData(
  customize?: (meterProvider: MeterProvider, meter: Meter) => void,
  meterProviderOptions?: MeterProviderOptions
): Promise<ResourceMetrics> {
  const meterProvider = new MeterProvider(meterProviderOptions);
  const reader = new InMemoryMetricReader();
  meterProvider.addMetricReader(reader);
  const meter = meterProvider.getMeter('test-meter');

  if (customize) {
    customize(meterProvider, meter);
  } else {
    // do some default action to generate metrics
    const labels: Attributes = {['keya']: 'value1', ['keyb']: 'value2'};
    const counter = meter.createCounter('name');
    counter.add(10, labels);
  }

  const {errors, resourceMetrics} = await reader.collect();
  if (errors.length !== 0) {
    throw errors;
  }
  return resourceMetrics;
}

export function emptyResourceMetrics(): ResourceMetrics {
  return {
    resource: Resource.EMPTY,
    scopeMetrics: [],
  };
}
