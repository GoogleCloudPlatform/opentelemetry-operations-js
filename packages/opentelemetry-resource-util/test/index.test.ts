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

/**
 * Snapshot tests written using https://github.com/bahmutov/snap-shot-it. Snapshots are sorted
 * based on the config option in package.json.
 *
 * To update snapshots, use `npm run update-snapshot-tests`
 */

import {mapOtelResourceToMonitoredResource} from '../src';
import {resourceFromAttributes} from '@opentelemetry/resources';

import * as snapshot from 'snap-shot-it';
import * as assert from 'assert';

describe('mapOtelResourceToMonitoredResource', () => {
  [
    {
      title: 'should map to gce_instance',
      otelAttributes: {
        'cloud.platform': 'gcp_compute_engine',
        'cloud.availability_zone': 'foo',
        'host.id': 'myhost',
      },
    },

    {
      title: 'should map to aws_ec2_instance"',
      otelAttributes: {
        'cloud.platform': 'aws_ec2',
        'cloud.availability_zone': 'myavailzone',
        'host.id': 'myhostid',
        'cloud.account.id': 'myawsaccount',
      },
    },

    {
      title: 'should map to aws_ec2_instance with region fallback',
      otelAttributes: {
        'cloud.platform': 'aws_ec2',
        'cloud.region': 'myregion',
        'host.id': 'myhostid',
        'cloud.account.id': 'myawsaccount',
      },
    },

    {
      title: 'should map to cloud_run_revision"',
      otelAttributes: {
        'cloud.platform': 'gcp_cloud_run',
        'cloud.region': 'myregion',
        'faas.instance': 'myfaasinstance',
        'faas.name': 'myfaasname',
        'faas.version': 'myfaasversion',
        'service.name': 'servicename',
        'service.instance.id': 'serviceinstanceid',
      },
      includeUnsupportedResources: true,
    },
    {
      title:
        'should map cloud_run_revision to generic_task when not including unsupported resources"',
      otelAttributes: {
        'cloud.platform': 'gcp_cloud_run',
        'cloud.region': 'myregion',
        'faas.instance': 'myfaasinstance',
        'faas.name': 'myfaasname',
        'faas.version': 'myfaasversion',
        'service.name': 'servicename',
        'service.namespace': 'servicens',
        'service.instance.id': 'serviceinstanceid',
      },
      includeUnsupportedResources: false,
    },

    {
      title: 'should map to cloud_function"',
      otelAttributes: {
        'cloud.platform': 'gcp_cloud_functions',
        'cloud.region': 'myregion',
        'faas.instance': 'myfaasinstance',
        'faas.name': 'myfaasname',
        'faas.version': 'myfaasversion',
        'service.name': 'servicename',
        'service.instance.id': 'serviceinstanceid',
      },
      includeUnsupportedResources: true,
    },
    {
      title:
        'should map cloud_function to generic_task when not including unsupported resources"',
      otelAttributes: {
        'cloud.platform': 'gcp_cloud_functions',
        'cloud.region': 'myregion',
        'faas.instance': 'myfaasinstance',
        'faas.name': 'myfaasname',
        'faas.version': 'myfaasversion',
        'service.name': 'servicename',
        'service.namespace': 'servicens',
        'service.instance.id': 'serviceinstanceid',
      },
      includeUnsupportedResources: false,
    },

    {
      title: 'should map to gae_instance"',
      otelAttributes: {
        'cloud.platform': 'gcp_app_engine',
        'cloud.region': 'myregion',
        'faas.instance': 'myfaasinstance',
        'faas.name': 'myfaasname',
        'faas.version': 'myfaasversion',
        'service.name': 'servicename',
        'service.instance.id': 'serviceinstanceid',
      },
    },

    {
      title: 'should map to generic_task',
      otelAttributes: {
        'cloud.availability_zone': 'myavailzone',
        'service.namespace': 'servicens',
        'service.name': 'servicename',
        'service.instance.id': 'serviceinstanceid',
      },
    },
    {
      title:
        'should map to generic_task with unknown_service* if no better match found',
      otelAttributes: {
        'cloud.availability_zone': 'myavailzone',
        'service.namespace': 'servicens',
        'service.name': 'unknown_service:node',
        'service.instance.id': 'serviceinstanceid',
      },
    },

    {
      title: 'should map to generic_task with fallback to region',
      otelAttributes: {
        'cloud.region': 'myregion',
        'service.namespace': 'servicens',
        'service.name': 'servicename',
        'service.instance.id': 'serviceinstanceid',
      },
    },

    {
      title: 'should map to generic_task with fallback to global',
      otelAttributes: {
        'service.namespace': 'servicens',
        'service.name': 'servicename',
        'service.instance.id': 'serviceinstanceid',
      },
    },

    {
      title: 'should map to generic_task with fallback to faas.name',
      otelAttributes: {
        'cloud.availability_zone': 'myavailzone',
        'service.namespace': 'servicens',
        'service.instance.id': 'serviceinstanceid',
        'faas.name': 'myfaasname',
      },
    },
    {
      title:
        'should map to generic_task with fallback to faas.name if service.name="unknown_service*"',
      otelAttributes: {
        'cloud.region': 'myregion',
        'faas.instance': 'myfaasinstance',
        'faas.name': 'myfaasname',
        'service.name': 'unknown_service:foo',
        'service.namespace': 'servicens',
      },
    },
    {
      title: 'should map to generic_task with fallback to faas.instance',
      otelAttributes: {
        'cloud.availability_zone': 'myavailzone',
        'service.namespace': 'servicens',
        'service.name': 'servicename',
        'faas.instance': 'myfaasinstance',
      },
    },

    {
      title: 'should map to generic_node',
      otelAttributes: {
        'cloud.availability_zone': 'myavailzone',
        'service.namespace': 'servicens',
        'service.name': 'servicename',
        'host.id': 'hostid',
      },
    },

    {
      title: 'should map to generic_node fallback to region',
      otelAttributes: {
        'cloud.region': 'myregion',
        'service.namespace': 'servicens',
        'service.name': 'servicename',
        'host.id': 'hostid',
      },
    },

    {
      title: 'should map to generic_node with fallback to global',
      otelAttributes: {
        'service.namespace': 'servicens',
        'service.name': 'servicename',
        'host.id': 'hostid',
      },
    },

    {
      title: 'should map to generic_node with fallback to host.name',
      otelAttributes: {
        'service.namespace': 'servicens',
        'service.name': 'servicename',
        'host.name': 'hostname',
      },
    },

    {
      title: 'should map empty resource to generic_node',
      otelAttributes: {foo: 'bar', 'no.useful': 'resourceattribs'},
    },
  ].forEach(({title, otelAttributes, includeUnsupportedResources}) => {
    it(title, () => {
      const resource = resourceFromAttributes(otelAttributes);
      const actual = mapOtelResourceToMonitoredResource(
        resource,
        includeUnsupportedResources
      );
      snapshot(actual);
    });
  });

  describe('for k8s resource', () => {
    [
      {on: 'gcp_kubernetes_engine', platform: 'gcp_kubernetes_engine'},
      {on: 'azure_aks', platform: 'azure_aks'},
      {on: 'aws_eks', platform: 'aws_eks'},
      {on: 'non-cloud', platform: undefined},
    ].map(({on, platform}) => {
      [
        {
          title: `should map to k8s_container on ${on}`,
          otelAttributes: {
            'cloud.platform': platform,
            'cloud.availability_zone': 'myavailzone',
            'k8s.cluster.name': 'mycluster',
            'k8s.namespace.name': 'myns',
            'k8s.pod.name': 'mypod',
            'k8s.container.name': 'mycontainer',
          },
        },

        {
          title: `should map to k8s_container with region fallback on ${on}`,
          otelAttributes: {
            'cloud.platform': platform,
            'cloud.region': 'myregion',
            'k8s.cluster.name': 'mycluster',
            'k8s.namespace.name': 'myns',
            'k8s.pod.name': 'mypod',
            'k8s.container.name': 'mycontainer',
          },
        },

        {
          title: `should map to k8s_pod on ${on}`,
          otelAttributes: {
            'cloud.platform': platform,
            'cloud.availability_zone': 'myavailzone',
            'k8s.cluster.name': 'mycluster',
            'k8s.namespace.name': 'myns',
            'k8s.pod.name': 'mypod',
          },
        },

        {
          title: `should map to k8s_pod with region fallback on ${on}`,
          otelAttributes: {
            'cloud.platform': platform,
            'cloud.region': 'myregion',
            'k8s.cluster.name': 'mycluster',
            'k8s.namespace.name': 'myns',
            'k8s.pod.name': 'mypod',
          },
        },

        {
          title: `should map to k8s_node on ${on}`,
          otelAttributes: {
            'cloud.platform': platform,
            'cloud.availability_zone': 'myavailzone',
            'k8s.cluster.name': 'mycluster',
            'k8s.namespace.name': 'myns',
            'k8s.node.name': 'mynode',
          },
        },

        {
          title: `should map to k8s_node with region fallback on ${on}`,
          otelAttributes: {
            'cloud.platform': platform,
            'cloud.region': 'myregion',
            'k8s.cluster.name': 'mycluster',
            'k8s.namespace.name': 'myns',
            'k8s.node.name': 'mynode',
          },
        },

        {
          title: `should map to k8s_cluster on ${on}`,
          otelAttributes: {
            'cloud.platform': platform,
            'cloud.availability_zone': 'myavailzone',
            'k8s.cluster.name': 'mycluster',
            'k8s.namespace.name': 'myns',
          },
        },

        {
          title: `should map to k8s_cluster with region fallback on ${on}`,
          otelAttributes: {
            'cloud.platform': platform,
            'cloud.region': 'myregion',
            'k8s.cluster.name': 'mycluster',
            'k8s.namespace.name': 'myns',
          },
        },
      ].forEach(({title, otelAttributes}) => {
        it(title, () => {
          const resource = resourceFromAttributes(otelAttributes);
          const actual = mapOtelResourceToMonitoredResource(resource);
          snapshot(actual);
        });
      });
    });
  });

  it('should map non-string values to JSON strings', () => {
    [
      [undefined, ''],
      [123, '123'],
      [123.4, '123.4'],
      [[1, 2, 3, 4], '[1,2,3,4]'],
      [[1.1, 2.2, 3.3, 4.4], '[1.1,2.2,3.3,4.4]'],
      [['a', 'b', 'c', 'd'], '["a","b","c","d"]'],
      [['a', null, 'c', 'd', undefined], '["a",null,"c","d",null]'],
    ].forEach(([value, expect]) => {
      const monitoredResource = mapOtelResourceToMonitoredResource(
        resourceFromAttributes({'host.id': value})
      );
      const mappedValue = monitoredResource.labels['node_id'];

      assert.strictEqual(mappedValue, expect);
    });
  });
});
