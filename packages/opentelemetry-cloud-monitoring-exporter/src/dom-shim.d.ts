// Copyright 2026 Google LLC
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

/**
 * Global type shim for web/DOM File type referenced by transitive gaxios types in Node.js environments.
 * gaxios prefers globalThis.fetch in Node 18+, bringing WHATWG/Web standard fetch types into its public
 * .d.ts signatures. See: https://github.com/googleapis/google-cloud-node/pull/8107
 */
declare type File = unknown;
