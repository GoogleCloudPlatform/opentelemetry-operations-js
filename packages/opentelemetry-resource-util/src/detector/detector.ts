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
  SemanticResourceAttributes as Semconv,
  CloudPlatformValues,
} from '@opentelemetry/semantic-conventions';

import {Detector, Resource} from '@opentelemetry/resources';
import * as gce from './gce';
import * as gke from './gke';

export class GcpDetector implements Detector {
  async detect(): Promise<Resource> {
    if (await gke.onGke()) {
      return await this._gkeResource();
    } else if (await gce.onGce()) {
      return await this._gceResource();
    }

    return Resource.EMPTY;
  }

  private async _gkeResource(): Promise<Resource> {
    const [zoneOrRegion, k8sClusterName, hostId] = await Promise.all([
      gke.availabilityZoneOrRegion(),
      gke.clusterName(),
      gke.hostId(),
    ]);

    return new Resource({
      [Semconv.CLOUD_PLATFORM]: CloudPlatformValues.GCP_KUBERNETES_ENGINE,
      [zoneOrRegion.type === 'zone'
        ? Semconv.CLOUD_AVAILABILITY_ZONE
        : Semconv.CLOUD_REGION]: zoneOrRegion.value,
      [Semconv.K8S_CLUSTER_NAME]: k8sClusterName,
      [Semconv.HOST_ID]: hostId,
    });
  }

  private async _gceResource(): Promise<Resource> {
    const [zoneAndRegion, hostType, hostId, hostName] = await Promise.all([
      gce.availabilityZoneAndRegion(),
      gce.hostType(),
      gce.hostId(),
      gce.hostName(),
    ]);

    return new Resource({
      [Semconv.CLOUD_PLATFORM]: CloudPlatformValues.GCP_COMPUTE_ENGINE,
      [Semconv.CLOUD_AVAILABILITY_ZONE]: zoneAndRegion.zone,
      [Semconv.CLOUD_REGION]: zoneAndRegion.region,
      [Semconv.HOST_TYPE]: hostType,
      [Semconv.HOST_ID]: hostId,
      [Semconv.HOST_NAME]: hostName,
    });
  }
}
