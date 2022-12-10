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

import * as sinon from 'sinon';
import * as metadata from 'gcp-metadata';

import {GcpDetector} from '../../src/detector/detector';
import * as assert from 'assert';

describe('GcpDetector', () => {
  let metadataStub: sinon.SinonStubbedInstance<typeof metadata>;
  let envStub: NodeJS.ProcessEnv;
  beforeEach(() => {
    metadataStub = sinon.stub(metadata);
    envStub = sinon.replace(process, 'env', {});
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('detects a GKE resource', () => {
    beforeEach(() => {
      envStub.KUBERNETES_SERVICE_HOST = 'fake-service-host';
      metadataStub.instance
        .withArgs('id')
        .resolves(12345)

        .withArgs('attributes/cluster-name')
        .resolves('fake-cluster-name');
    });

    it('zonal', async () => {
      metadataStub.instance
        .withArgs('attributes/cluster-location')
        .resolves('us-east4-b');
      const resource = await new GcpDetector().detect();
      assert.deepStrictEqual(resource.attributes, {
        'cloud.availability_zone': 'us-east4-b',
        'cloud.platform': 'gcp_kubernetes_engine',
        'host.id': '12345',
        'k8s.cluster.name': 'fake-cluster-name',
      });
    });

    it('regional', async () => {
      metadataStub.instance
        .withArgs('attributes/cluster-location')
        .resolves('us-east4');
      const resource = await new GcpDetector().detect();
      assert.deepStrictEqual(resource.attributes, {
        'cloud.region': 'us-east4',
        'cloud.platform': 'gcp_kubernetes_engine',
        'host.id': '12345',
        'k8s.cluster.name': 'fake-cluster-name',
      });
    });
  });

  it('detects a GCE resource', async () => {
    metadataStub.instance
      .withArgs('id')
      .resolves(12345)

      .withArgs('machine-type')
      .resolves('fake-machine-type')

      .withArgs('hostname')
      .resolves('fake-hostname')

      .withArgs('zone')
      .resolves('projects/233510669999/zones/us-east4-b');

    const resource = await new GcpDetector().detect();
    assert.deepStrictEqual(resource.attributes, {
      'cloud.availability_zone': 'us-east4-b',
      'cloud.platform': 'gcp_compute_engine',
      'cloud.region': 'us-east4',
      'host.id': '12345',
      'host.name': 'fake-hostname',
      'host.type': 'fake-machine-type',
    });
  });

  it('detects empty resource when nothing else can be detected', async () => {
    // gcp-metadata throws when it can't access the metadata server
    metadataStub.instance.rejects();

    const resource = await new GcpDetector().detect();
    assert.deepStrictEqual(resource.attributes, {});
  });
});
