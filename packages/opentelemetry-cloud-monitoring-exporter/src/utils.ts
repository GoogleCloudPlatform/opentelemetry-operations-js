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

import {TimeSeries} from './types';

/** Returns the minimum number of arrays of max size chunkSize, partitioned from the given array. */
export function partitionList(list: TimeSeries[], chunkSize: number) {
  const listCopy = [...list];
  const results = [];
  while (listCopy.length) {
    results.push(listCopy.splice(0, chunkSize));
  }
  return results;
}
/** Mounts the GCP project id path */
export function mountProjectIdPath(projectId: string) {
  return `projects/${projectId}`;
}

/**
 * Returns the result of 2^value
 */
export function exp2(value: number): number {
  return Math.pow(2, value);
}

/**
 * Map array of numbers to strings
 *
 * @param values an array of numbers
 * @returns a list of strings for those integers
 */
export function numbersToStrings(values: number[]): string[] {
  return values.map(value => value.toString());
}
