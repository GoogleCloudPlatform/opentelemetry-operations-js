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

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as assert from 'assert';
import {SemanticResourceAttributes} from '@opentelemetry/semantic-conventions';
import {mapOtelResourceToMonitoredResource} from '../src';
import {Resource} from '@opentelemetry/resources';

describe('Monitored resource util', () => {
  const projectId = 'project_id';
  const mockAwsResource = {
    [SemanticResourceAttributes.CLOUD_PROVIDER]: 'aws',
    [SemanticResourceAttributes.HOST_ID]: 'host_id',
    [SemanticResourceAttributes.CLOUD_REGION]: 'my-region',
    [SemanticResourceAttributes.CLOUD_ACCOUNT_ID]: '12345',
  };
  const mockAwsMonitoredResource = {
    type: 'aws_ec2_instance',
    labels: {
      instance_id: 'host_id',
      project_id: projectId,
      region: 'aws:my-region',
      aws_account: '12345',
    },
  };
  const mockGCResource = {
    [SemanticResourceAttributes.CLOUD_PROVIDER]: 'gcp',
    [SemanticResourceAttributes.HOST_ID]: 'host_id',
    [SemanticResourceAttributes.CLOUD_AVAILABILITY_ZONE]: 'my-zone',
  };
  const mockGCMonitoredResource = {
    type: 'gce_instance',
    labels: {
      instance_id: 'host_id',
      project_id: projectId,
      zone: 'my-zone',
    },
  };
  const mockGlobalResource = {
    type: 'global',
    labels: {project_id: projectId},
  };

  describe('mapOtelResourceToMonitoredResource', () => {
    it('should map GCE OTel resource => gce_instance monitored resource', () => {
      const otelResource = new Resource(mockGCResource);
      const monitoredResource = mapOtelResourceToMonitoredResource(
        otelResource,
        projectId
      );
      assert.deepStrictEqual(monitoredResource, mockGCMonitoredResource);
    });

    it('should map AWS OTel resource => aws_ec2_instance monitored resource', () => {
      const otelResource = new Resource(mockAwsResource);
      const monitoredResource = mapOtelResourceToMonitoredResource(
        otelResource,
        projectId
      );
      assert.deepStrictEqual(monitoredResource, mockAwsMonitoredResource);
    });

    it('should map otherwise to global monitored resource', () => {
      const otelResource = Resource.default();
      const monitoredResource = mapOtelResourceToMonitoredResource(
        otelResource,
        projectId
      );
      assert.deepStrictEqual(monitoredResource, mockGlobalResource);
    });
  });
});
