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

type Labels = {[key: string]: string};
export interface MonitoredResource {
  type: string;
  labels: Labels;
}
type LabelMapping = {[key: string]: string};

const GCE_INSTANCE = 'gce_instance';
const AWS_EC2_INSTANCE = 'aws_ec2_instance';

const GCE_INSTANCE_LABEL_MAPPING: LabelMapping = {
  instance_id: ResourceAttributes.HOST_ID,
  zone: ResourceAttributes.CLOUD_AVAILABILITY_ZONE,
};
const AWS_EC2_INSTANCE_LABEL_MAPPING: LabelMapping = {
  instance_id: ResourceAttributes.HOST_ID,
  region: ResourceAttributes.CLOUD_REGION,
  aws_account: ResourceAttributes.CLOUD_ACCOUNT_ID,
};

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
    const labels = mapResourceAttributes(resource, GCE_INSTANCE_LABEL_MAPPING);
    if (labels !== undefined) {
      monitoredResource = {
        type: GCE_INSTANCE,
        labels: {
          ...commonLabels,
          ...labels,
        },
      };
    }
  } else if (cloudProvider === 'aws') {
    const labels = mapResourceAttributes(
      resource,
      AWS_EC2_INSTANCE_LABEL_MAPPING
    );
    if (labels !== undefined) {
      monitoredResource = {
        type: AWS_EC2_INSTANCE,
        labels: {
          ...commonLabels,
          ...labels,
          region: `aws:${labels.region}`,
        },
      };
    }
  }

  // fallback
  if (monitoredResource === undefined) {
    monitoredResource = {type: 'global', labels: {...commonLabels}};
  }

  return monitoredResource;
}

/**
 * Given a LabelMapping, maps the resource into labels. If any resource
 * attribute is missing, returns undefined.
 *
 * @param resource
 * @param labelMapping
 * @returns
 */
function mapResourceAttributes(
  resource: Resource,
  labelMapping: LabelMapping
): Labels | undefined {
  const labels: Labels = {};
  for (const [labelKey, labelSource] of Object.entries(labelMapping)) {
    const labelValue = resource.attributes[labelSource];
    if (typeof labelValue !== 'string') {
      return undefined;
    }
    labels[labelKey] = labelValue;
  }
  return labels;
}
