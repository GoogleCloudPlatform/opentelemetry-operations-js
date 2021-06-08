// Copyright 2021 Google LLC
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

import {Resource} from '@opentelemetry/resources';
import {ResourceAttributes} from '@opentelemetry/semantic-conventions';

const GCP_GCE_INSTANCE = 'gce_instance';
const AWS_EC2_INSTANCE = 'aws_ec2_instance';

export interface MonitoredResource {
  type: string;
  labels: {[key: string]: string};
}

/**
 * Given an OTel resource, return a MonitoredResource. If any field is missing,
 * return the global resource. The only currently supported monitored resources
 * are gce_instance and aws_ec2_instance.
 * @param resource
 * @param projectId
 */
export function mapOtelResourceToMonitoredResource(
  resource: Resource,
  projectId: string
): MonitoredResource {
  const cloudProvider = `${
    resource.attributes[ResourceAttributes.CLOUD_PROVIDER]
  }`;
  const commonLabels = {project_id: projectId};
  let monitoredResource: MonitoredResource | undefined;
  if (cloudProvider === 'gcp') {
    monitoredResource = {
      type: GCP_GCE_INSTANCE,
      labels: {
        ...commonLabels,
        instance_id: resource.attributes[ResourceAttributes.HOST_ID] as string,
        zone: resource.attributes[
          ResourceAttributes.CLOUD_AVAILABILITY_ZONE
        ] as string,
      },
    };
  } else if (cloudProvider === 'aws') {
    monitoredResource = {
      type: AWS_EC2_INSTANCE,
      labels: {
        ...commonLabels,
        instance_id: resource.attributes[ResourceAttributes.HOST_ID] as string,
        region: `aws:${resource.attributes[ResourceAttributes.CLOUD_REGION]}`,
        aws_account: resource.attributes[
          ResourceAttributes.CLOUD_ACCOUNT_ID
        ] as string,
      },
    };
  }

  // fallback or if the resource is missing label values
  if (
    monitoredResource === undefined ||
    hasUndefinedValue(monitoredResource.labels)
  ) {
    monitoredResource = {type: 'global', labels: {...commonLabels}};
  }

  return monitoredResource;
}

function hasUndefinedValue<T>(o: {[k: string]: T | undefined}): boolean {
  return Object.values(o).some(v => v === undefined);
}
