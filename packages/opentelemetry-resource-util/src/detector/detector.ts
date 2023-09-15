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
  CloudProviderValues,
} from '@opentelemetry/semantic-conventions';

import {Detector, DetectorSync, Resource} from '@opentelemetry/resources';
import * as gce from './gce';
import * as gke from './gke';
import * as faas from './faas';
import * as gae from './gae';
import * as metadata from 'gcp-metadata';
import {Attributes} from '@opentelemetry/api';

async function detect(): Promise<Resource> {
  if (!(await metadata.isAvailable())) {
    return Resource.EMPTY;
  }

  // Note the order of these if checks is significant with more specific resources coming
  // first. E.g. Cloud Functions gen2 are executed in Cloud Run so it must be checked first.
  if (await gke.onGke()) {
    return await gkeResource();
  } else if (await faas.onCloudFunctions()) {
    return await cloudFunctionsResource();
  } else if (await faas.onCloudRun()) {
    return await cloudRunResource();
  } else if (await gae.onAppEngine()) {
    return await gaeResource();
  } else if (await gce.onGce()) {
    return await gceResource();
  }

  return Resource.EMPTY;
}

async function gkeResource(): Promise<Resource> {
  const [zoneOrRegion, k8sClusterName, hostId] = await Promise.all([
    gke.availabilityZoneOrRegion(),
    gke.clusterName(),
    gke.hostId(),
  ]);

  return await makeResource({
    [Semconv.CLOUD_PLATFORM]: CloudPlatformValues.GCP_KUBERNETES_ENGINE,
    [zoneOrRegion.type === 'zone'
      ? Semconv.CLOUD_AVAILABILITY_ZONE
      : Semconv.CLOUD_REGION]: zoneOrRegion.value,
    [Semconv.K8S_CLUSTER_NAME]: k8sClusterName,
    [Semconv.HOST_ID]: hostId,
  });
}

async function cloudRunResource(): Promise<Resource> {
  const [faasName, faasVersion, faasInstance, faasCloudRegion] =
    await Promise.all([
      faas.faasName(),
      faas.faasVersion(),
      faas.faasInstance(),
      faas.faasCloudRegion(),
    ]);

  return await makeResource({
    [Semconv.CLOUD_PLATFORM]: CloudPlatformValues.GCP_CLOUD_RUN,
    [Semconv.FAAS_NAME]: faasName,
    [Semconv.FAAS_VERSION]: faasVersion,
    [Semconv.FAAS_INSTANCE]: faasInstance,
    [Semconv.CLOUD_REGION]: faasCloudRegion,
  });
}

async function cloudFunctionsResource(): Promise<Resource> {
  const [faasName, faasVersion, faasInstance, faasCloudRegion] =
    await Promise.all([
      faas.faasName(),
      faas.faasVersion(),
      faas.faasInstance(),
      faas.faasCloudRegion(),
    ]);

  return await makeResource({
    [Semconv.CLOUD_PLATFORM]: CloudPlatformValues.GCP_CLOUD_FUNCTIONS,
    [Semconv.FAAS_NAME]: faasName,
    [Semconv.FAAS_VERSION]: faasVersion,
    [Semconv.FAAS_INSTANCE]: faasInstance,
    [Semconv.CLOUD_REGION]: faasCloudRegion,
  });
}

async function gaeResource(): Promise<Resource> {
  let zone, region;
  if (await gae.onAppEngineStandard()) {
    [zone, region] = await Promise.all([
      gae.standardAvailabilityZone(),
      gae.standardCloudRegion(),
    ]);
  } else {
    ({zone, region} = await gce.availabilityZoneAndRegion());
  }
  const [faasName, faasVersion, faasInstance] = await Promise.all([
    gae.serviceName(),
    gae.serviceVersion(),
    gae.serviceInstance(),
  ]);

  return await makeResource({
    [Semconv.CLOUD_PLATFORM]: CloudPlatformValues.GCP_APP_ENGINE,
    [Semconv.FAAS_NAME]: faasName,
    [Semconv.FAAS_VERSION]: faasVersion,
    [Semconv.FAAS_INSTANCE]: faasInstance,
    [Semconv.CLOUD_AVAILABILITY_ZONE]: zone,
    [Semconv.CLOUD_REGION]: region,
  });
}

async function gceResource(): Promise<Resource> {
  const [zoneAndRegion, hostType, hostId, hostName] = await Promise.all([
    gce.availabilityZoneAndRegion(),
    gce.hostType(),
    gce.hostId(),
    gce.hostName(),
  ]);

  return await makeResource({
    [Semconv.CLOUD_PLATFORM]: CloudPlatformValues.GCP_COMPUTE_ENGINE,
    [Semconv.CLOUD_AVAILABILITY_ZONE]: zoneAndRegion.zone,
    [Semconv.CLOUD_REGION]: zoneAndRegion.region,
    [Semconv.HOST_TYPE]: hostType,
    [Semconv.HOST_ID]: hostId,
    [Semconv.HOST_NAME]: hostName,
  });
}

async function makeResource(attrs: Attributes): Promise<Resource> {
  const project = await metadata.project<string>('project-id');

  return new Resource({
    [Semconv.CLOUD_PROVIDER]: CloudProviderValues.GCP,
    [Semconv.CLOUD_ACCOUNT_ID]: project,
    ...attrs,
  });
}

/**
 * Async Google Cloud resource detector which populates attributes based the on environment
 * this process is running in. If not on GCP, returns an empty resource.
 *
 * @deprecated Async resource detectors are deprecated. Please use {@link GcpDetectorSync} instead.
 */
export class GcpDetector implements Detector {
  detect = detect;
}

/**
 * Google Cloud resource detector which populates attributes based on the environment this
 * process is running in. If not on GCP, returns an empty resource.
 */
export class GcpDetectorSync implements DetectorSync {
  private async _asyncAttributes(): Promise<Attributes> {
    return (await detect()).attributes;
  }

  detect(): Resource {
    return new Resource({}, this._asyncAttributes());
  }
}
