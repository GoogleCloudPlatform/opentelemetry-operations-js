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

export interface ExporterOptions {
  /**
   * Google Cloud Platform project ID where your metrics will be stored.
   * This is optional and will be inferred from your authentication
   * credentials or from the GCP environment when not specified.
   */
  projectId?: string;
  /**
   * Path to a .json, .pem, or .p12 key file. This is optional and
   * authentication keys will be inferred from the environment if you
   * are running on GCP.
   */
  keyFilename?: string;
  /**
   * Path to a .json, .pem, or .p12 key file. This is optional and
   * authentication keys will be inferred from the environment if you
   * are running on GCP.
   */
  keyFile?: string;
  /**
   * Object containing client_email and private_key properties
   */
  credentials?: Credentials;
  /**
   * Prefix prepended to OpenTelemetry metric names when writing to Cloud Monitoring. See
   * https://cloud.google.com/monitoring/custom-metrics#identifier for more details.
   *
   * Optional, default is `workload.googleapis.com`.
   */
  prefix?: string;
  /**
   * The api endpoint of the cloud monitoring service. Defaults to
   * monitoring.googleapis.com:443.
   */
  apiEndpoint?: string;
  /**
   * Assume all metric descriptors have already been created and publish
   * metrics without checking. This can prevent hitting a rate limit in Google
   * when a large number of clients are all started up at the same time.
   */
  disableCreateMetricDescriptors?: boolean;
}

export interface Credentials {
  client_email?: string;
  private_key?: string;
}
