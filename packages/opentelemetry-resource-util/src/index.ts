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

import {Attributes, AttributeValue} from '@opentelemetry/api';
import {IResource} from '@opentelemetry/resources';
import {
  SemanticResourceAttributes,
  CloudPlatformValues,
} from '@opentelemetry/semantic-conventions';

const AWS_ACCOUNT = 'aws_account';
const AWS_EC2_INSTANCE = 'aws_ec2_instance';
const CLOUD_FUNCTION = 'cloud_function';
const CLOUD_RUN_REVISION = 'cloud_run_revision';
const CLUSTER_NAME = 'cluster_name';
const CONFIGURATION_NAME = 'configuration_name';
const CONTAINER_NAME = 'container_name';
const FUNCTION_NAME = 'function_name';
const GAE_INSTANCE = 'gae_instance';
const GAE_MODULE_ID = 'module_id';
const GAE_VERSION_ID = 'version_id';
const GCE_INSTANCE = 'gce_instance';
const GENERIC_NODE = 'generic_node';
const GENERIC_TASK = 'generic_task';
const INSTANCE_ID = 'instance_id';
const JOB = 'job';
const K8S_CLUSTER = 'k8s_cluster';
const K8S_CONTAINER = 'k8s_container';
const K8S_NODE = 'k8s_node';
const K8S_POD = 'k8s_pod';
const LOCATION = 'location';
const NAMESPACE = 'namespace';
const NAMESPACE_NAME = 'namespace_name';
const NODE_ID = 'node_id';
const NODE_NAME = 'node_name';
const POD_NAME = 'pod_name';
const REGION = 'region';
const REVISION_NAME = 'revision_name';
const SERVICE_NAME = 'service_name';
const TASK_ID = 'task_id';
const ZONE = 'zone';

const UNKNOWN_SERVICE_PREFIX = 'unknown_service';

/**
 * Mappings of GCM resource label keys onto mapping config from OTel resource for a given
 * monitored resource type. Copied from Go impl:
 * https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/v1.8.0/internal/resourcemapping/resourcemapping.go#L51
 */
const MAPPINGS = {
  [GCE_INSTANCE]: {
    [ZONE]: {otelKeys: [SemanticResourceAttributes.CLOUD_AVAILABILITY_ZONE]},
    [INSTANCE_ID]: {otelKeys: [SemanticResourceAttributes.HOST_ID]},
  },
  [K8S_CONTAINER]: {
    [LOCATION]: {
      otelKeys: [
        SemanticResourceAttributes.CLOUD_AVAILABILITY_ZONE,
        SemanticResourceAttributes.CLOUD_REGION,
      ],
    },
    [CLUSTER_NAME]: {otelKeys: [SemanticResourceAttributes.K8S_CLUSTER_NAME]},
    [NAMESPACE_NAME]: {
      otelKeys: [SemanticResourceAttributes.K8S_NAMESPACE_NAME],
    },
    [POD_NAME]: {otelKeys: [SemanticResourceAttributes.K8S_POD_NAME]},
    [CONTAINER_NAME]: {
      otelKeys: [SemanticResourceAttributes.K8S_CONTAINER_NAME],
    },
  },
  [K8S_POD]: {
    [LOCATION]: {
      otelKeys: [
        SemanticResourceAttributes.CLOUD_AVAILABILITY_ZONE,
        SemanticResourceAttributes.CLOUD_REGION,
      ],
    },
    [CLUSTER_NAME]: {otelKeys: [SemanticResourceAttributes.K8S_CLUSTER_NAME]},
    [NAMESPACE_NAME]: {
      otelKeys: [SemanticResourceAttributes.K8S_NAMESPACE_NAME],
    },
    [POD_NAME]: {otelKeys: [SemanticResourceAttributes.K8S_POD_NAME]},
  },
  [K8S_NODE]: {
    [LOCATION]: {
      otelKeys: [
        SemanticResourceAttributes.CLOUD_AVAILABILITY_ZONE,
        SemanticResourceAttributes.CLOUD_REGION,
      ],
    },
    [CLUSTER_NAME]: {otelKeys: [SemanticResourceAttributes.K8S_CLUSTER_NAME]},
    [NODE_NAME]: {otelKeys: [SemanticResourceAttributes.K8S_NODE_NAME]},
  },
  [K8S_CLUSTER]: {
    [LOCATION]: {
      otelKeys: [
        SemanticResourceAttributes.CLOUD_AVAILABILITY_ZONE,
        SemanticResourceAttributes.CLOUD_REGION,
      ],
    },
    [CLUSTER_NAME]: {otelKeys: [SemanticResourceAttributes.K8S_CLUSTER_NAME]},
  },
  [AWS_EC2_INSTANCE]: {
    [INSTANCE_ID]: {otelKeys: [SemanticResourceAttributes.HOST_ID]},
    [REGION]: {
      otelKeys: [
        SemanticResourceAttributes.CLOUD_AVAILABILITY_ZONE,
        SemanticResourceAttributes.CLOUD_REGION,
      ],
    },
    [AWS_ACCOUNT]: {otelKeys: [SemanticResourceAttributes.CLOUD_ACCOUNT_ID]},
  },
  [CLOUD_RUN_REVISION]: {
    [LOCATION]: {otelKeys: [SemanticResourceAttributes.CLOUD_REGION]},
    [SERVICE_NAME]: {otelKeys: [SemanticResourceAttributes.FAAS_NAME]},
    [CONFIGURATION_NAME]: {otelKeys: [SemanticResourceAttributes.FAAS_NAME]},
    [REVISION_NAME]: {otelKeys: [SemanticResourceAttributes.FAAS_VERSION]},
  },
  [CLOUD_FUNCTION]: {
    [REGION]: {otelKeys: [SemanticResourceAttributes.CLOUD_REGION]},
    [FUNCTION_NAME]: {otelKeys: [SemanticResourceAttributes.FAAS_NAME]},
  },
  [GAE_INSTANCE]: {
    [LOCATION]: {
      otelKeys: [
        SemanticResourceAttributes.CLOUD_AVAILABILITY_ZONE,
        SemanticResourceAttributes.CLOUD_REGION,
      ],
    },
    [GAE_MODULE_ID]: {otelKeys: [SemanticResourceAttributes.FAAS_NAME]},
    [GAE_VERSION_ID]: {otelKeys: [SemanticResourceAttributes.FAAS_VERSION]},
    [INSTANCE_ID]: {otelKeys: [SemanticResourceAttributes.FAAS_INSTANCE]},
  },
  [GENERIC_TASK]: {
    [LOCATION]: {
      otelKeys: [
        SemanticResourceAttributes.CLOUD_AVAILABILITY_ZONE,
        SemanticResourceAttributes.CLOUD_REGION,
      ],
      fallback: 'global',
    },
    [NAMESPACE]: {otelKeys: [SemanticResourceAttributes.SERVICE_NAMESPACE]},
    [JOB]: {
      otelKeys: [
        SemanticResourceAttributes.SERVICE_NAME,
        SemanticResourceAttributes.FAAS_NAME,
      ],
    },
    [TASK_ID]: {
      otelKeys: [
        SemanticResourceAttributes.SERVICE_INSTANCE_ID,
        SemanticResourceAttributes.FAAS_INSTANCE,
      ],
    },
  },
  [GENERIC_NODE]: {
    [LOCATION]: {
      otelKeys: [
        SemanticResourceAttributes.CLOUD_AVAILABILITY_ZONE,
        SemanticResourceAttributes.CLOUD_REGION,
      ],
      fallback: 'global',
    },
    [NAMESPACE]: {otelKeys: [SemanticResourceAttributes.SERVICE_NAMESPACE]},
    [NODE_ID]: {
      otelKeys: [
        SemanticResourceAttributes.HOST_ID,
        SemanticResourceAttributes.HOST_NAME,
      ],
    },
  },
} as const;

type Mapping = {
  [key: string]: {
    readonly otelKeys: readonly string[];
    readonly fallback?: string;
  };
};

type Labels = {[key: string]: string};
export interface MonitoredResource {
  type: string;
  labels: Labels;
}

/**
 * Given an OTel resource, return a MonitoredResource. Copied from the collector's
 * implementation in Go:
 * https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/v1.8.0/internal/resourcemapping/resourcemapping.go#L51
 *
 * @param resource the OTel Resource
 * @returns the corresponding GCM MonitoredResource
 */
export function mapOtelResourceToMonitoredResource(
  resource: IResource
): MonitoredResource;
/**
 * @deprecated This overload is deprecated, do not pass the includeUnsupportedResources boolean
 * parameter. It will be removed in the next major version release.
 *
 * @param resource the OTel Resource
 * @returns the corresponding GCM MonitoredResource
 */
export function mapOtelResourceToMonitoredResource(
  resource: IResource,
  includeUnsupportedResources: boolean | undefined
): MonitoredResource;
export function mapOtelResourceToMonitoredResource(
  resource: IResource,
  includeUnsupportedResources = false
): MonitoredResource {
  const attrs = resource.attributes;
  const platform = attrs[SemanticResourceAttributes.CLOUD_PLATFORM];

  let mr: MonitoredResource;
  if (platform === CloudPlatformValues.GCP_COMPUTE_ENGINE) {
    mr = createMonitoredResource(GCE_INSTANCE, attrs);
  } else if (platform === CloudPlatformValues.GCP_KUBERNETES_ENGINE) {
    if (SemanticResourceAttributes.K8S_CONTAINER_NAME in attrs) {
      mr = createMonitoredResource(K8S_CONTAINER, attrs);
    } else if (SemanticResourceAttributes.K8S_POD_NAME in attrs) {
      mr = createMonitoredResource(K8S_POD, attrs);
    } else if (SemanticResourceAttributes.K8S_NODE_NAME in attrs) {
      mr = createMonitoredResource(K8S_NODE, attrs);
    } else {
      mr = createMonitoredResource(K8S_CLUSTER, attrs);
    }
  } else if (platform === CloudPlatformValues.GCP_APP_ENGINE) {
    mr = createMonitoredResource(GAE_INSTANCE, attrs);
  } else if (platform === CloudPlatformValues.AWS_EC2) {
    mr = createMonitoredResource(AWS_EC2_INSTANCE, attrs);
  }
  // Cloud Run and Cloud Functions are not writeable for custom metrics yet
  else if (
    includeUnsupportedResources &&
    platform === CloudPlatformValues.GCP_CLOUD_RUN
  ) {
    mr = createMonitoredResource(CLOUD_RUN_REVISION, attrs);
  } else if (
    includeUnsupportedResources &&
    platform === CloudPlatformValues.GCP_CLOUD_FUNCTIONS
  ) {
    mr = createMonitoredResource(CLOUD_FUNCTION, attrs);
  } else {
    // fallback to generic_task
    if (
      (SemanticResourceAttributes.SERVICE_NAME in attrs ||
        SemanticResourceAttributes.FAAS_NAME in attrs) &&
      (SemanticResourceAttributes.SERVICE_INSTANCE_ID in attrs ||
        SemanticResourceAttributes.FAAS_INSTANCE in attrs)
    ) {
      mr = createMonitoredResource(GENERIC_TASK, attrs);
    } else {
      // If not possible, finally fallback to generic_node
      mr = createMonitoredResource(GENERIC_NODE, attrs);
    }
  }

  return mr;
}

function createMonitoredResource(
  monitoredResourceType: keyof typeof MAPPINGS,
  resourceAttrs: Attributes
): MonitoredResource {
  const mapping: Mapping = MAPPINGS[monitoredResourceType];
  const labels: {[key: string]: string} = {};

  Object.entries(mapping).map(([mrKey, mapConfig]) => {
    let mrValue: AttributeValue | undefined;
    const test: string | undefined = undefined;
    for (const otelKey of mapConfig.otelKeys) {
      if (
        otelKey in resourceAttrs &&
        !resourceAttrs[otelKey]?.toString()?.startsWith(UNKNOWN_SERVICE_PREFIX)
      ) {
        mrValue = resourceAttrs[otelKey];
        break;
      }
    }

    if (
      mrValue === undefined &&
      mapConfig.otelKeys.includes(SemanticResourceAttributes.SERVICE_NAME)
    ) {
      // The service name started with unknown_service, was ignored above, and we couldn't find
      // a better value for mrValue.
      mrValue = resourceAttrs[SemanticResourceAttributes.SERVICE_NAME];
    }
    if (mrValue === undefined) {
      mrValue = mapConfig.fallback ?? '';
    }

    // OTel attribute values can be any of string, boolean, number, or array of any of them.
    // Encode any non-strings as json string
    if (typeof mrValue !== 'string') {
      mrValue = JSON.stringify(mrValue);
    }

    labels[mrKey] = mrValue;
  });

  return {
    type: monitoredResourceType,
    labels,
  };
}

export {GcpDetector, GcpDetectorSync} from './detector/detector';
