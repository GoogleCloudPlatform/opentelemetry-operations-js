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
import {Resource} from '@opentelemetry/resources';

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
      title: 'should map to k8s_container',
      otelAttributes: {
        'cloud.platform': 'gcp_kubernetes_engine',
        'cloud.availability_zone': 'myavailzone',
        'k8s.cluster.name': 'mycluster',
        'k8s.namespace.name': 'myns',
        'k8s.pod.name': 'mypod',
        'k8s.container.name': 'mycontainer',
      },
    },

    {
      title: 'should map to k8s_container with region fallback',
      otelAttributes: {
        'cloud.platform': 'gcp_kubernetes_engine',
        'cloud.region': 'myregion',
        'k8s.cluster.name': 'mycluster',
        'k8s.namespace.name': 'myns',
        'k8s.pod.name': 'mypod',
        'k8s.container.name': 'mycontainer',
      },
    },

    {
      title: 'should map to k8s_pod',
      otelAttributes: {
        'cloud.platform': 'gcp_kubernetes_engine',
        'cloud.availability_zone': 'myavailzone',
        'k8s.cluster.name': 'mycluster',
        'k8s.namespace.name': 'myns',
        'k8s.pod.name': 'mypod',
      },
    },

    {
      title: 'should map to k8s_pod with region fallback',
      otelAttributes: {
        'cloud.platform': 'gcp_kubernetes_engine',
        'cloud.region': 'myregion',
        'k8s.cluster.name': 'mycluster',
        'k8s.namespace.name': 'myns',
        'k8s.pod.name': 'mypod',
      },
    },

    {
      title: 'should map to k8s_node',
      otelAttributes: {
        'cloud.platform': 'gcp_kubernetes_engine',
        'cloud.availability_zone': 'myavailzone',
        'k8s.cluster.name': 'mycluster',
        'k8s.namespace.name': 'myns',
        'k8s.node.name': 'mynode',
      },
    },

    {
      title: 'should map to k8s_node with region fallback',
      otelAttributes: {
        'cloud.platform': 'gcp_kubernetes_engine',
        'cloud.region': 'myregion',
        'k8s.cluster.name': 'mycluster',
        'k8s.namespace.name': 'myns',
        'k8s.node.name': 'mynode',
      },
    },

    {
      title: 'should map to k8s_cluster',
      otelAttributes: {
        'cloud.platform': 'gcp_kubernetes_engine',
        'cloud.availability_zone': 'myavailzone',
        'k8s.cluster.name': 'mycluster',
        'k8s.namespace.name': 'myns',
      },
    },

    {
      title: 'should map to k8s_cluster with region fallback',
      otelAttributes: {
        'cloud.platform': 'gcp_kubernetes_engine',
        'cloud.region': 'myregion',
        'k8s.cluster.name': 'mycluster',
        'k8s.namespace.name': 'myns',
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
      title: 'should map to generic_task',
      otelAttributes: {
        'cloud.availability_zone': 'myavailzone',
        'service.namespace': 'servicens',
        'service.name': 'servicename',
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
  ].forEach(({title, otelAttributes}) => {
    it(title, () => {
      const resource = new Resource(otelAttributes);
      const actual = mapOtelResourceToMonitoredResource(resource);
      snapshot(actual);
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
        new Resource({'host.id': value})
      );
      const mappedValue = monitoredResource.labels['node_id'];

      assert.strictEqual(mappedValue, expect);
    });
  });
});
