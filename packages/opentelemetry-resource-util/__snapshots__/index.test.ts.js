exports['mapOtelResourceToMonitoredResource should map cloud_function to generic_task when not including unsupported resources" 1'] = {
  "type": "generic_task",
  "labels": {
    "location": "myregion",
    "namespace": "servicens",
    "job": "servicename",
    "task_id": "serviceinstanceid"
  }
}

exports['mapOtelResourceToMonitoredResource should map cloud_run_revision to generic_task when not including unsupported resources" 1'] = {
  "type": "generic_task",
  "labels": {
    "location": "myregion",
    "namespace": "servicens",
    "job": "servicename",
    "task_id": "serviceinstanceid"
  }
}

exports['mapOtelResourceToMonitoredResource should map empty resource to generic_node 1'] = {
  "type": "generic_node",
  "labels": {
    "location": "global",
    "namespace": "",
    "node_id": ""
  }
}

exports['mapOtelResourceToMonitoredResource should map to aws_ec2_instance with region fallback 1'] = {
  "type": "aws_ec2_instance",
  "labels": {
    "instance_id": "myhostid",
    "region": "myregion",
    "aws_account": "myawsaccount"
  }
}

exports['mapOtelResourceToMonitoredResource should map to aws_ec2_instance" 1'] = {
  "type": "aws_ec2_instance",
  "labels": {
    "instance_id": "myhostid",
    "region": "myavailzone",
    "aws_account": "myawsaccount"
  }
}

exports['mapOtelResourceToMonitoredResource should map to cloud_function" 1'] = {
  "type": "cloud_function",
  "labels": {
    "region": "myregion",
    "function_name": "myfaasname"
  }
}

exports['mapOtelResourceToMonitoredResource should map to cloud_run_revision" 1'] = {
  "type": "cloud_run_revision",
  "labels": {
    "location": "myregion",
    "service_name": "myfaasname",
    "configuration_name": "myfaasname",
    "revision_name": "myfaasversion"
  }
}

exports['mapOtelResourceToMonitoredResource should map to gae_instance" 1'] = {
  "type": "gae_instance",
  "labels": {
    "location": "myregion",
    "module_id": "myfaasname",
    "version_id": "myfaasversion",
    "instance_id": "myfaasinstance"
  }
}

exports['mapOtelResourceToMonitoredResource should map to gce_instance 1'] = {
  "type": "gce_instance",
  "labels": {
    "zone": "foo",
    "instance_id": "myhost"
  }
}

exports['mapOtelResourceToMonitoredResource should map to generic_node 1'] = {
  "type": "generic_node",
  "labels": {
    "location": "myavailzone",
    "namespace": "servicens",
    "node_id": "hostid"
  }
}

exports['mapOtelResourceToMonitoredResource should map to generic_node fallback to region 1'] = {
  "type": "generic_node",
  "labels": {
    "location": "myregion",
    "namespace": "servicens",
    "node_id": "hostid"
  }
}

exports['mapOtelResourceToMonitoredResource should map to generic_node with fallback to global 1'] = {
  "type": "generic_node",
  "labels": {
    "location": "global",
    "namespace": "servicens",
    "node_id": "hostid"
  }
}

exports['mapOtelResourceToMonitoredResource should map to generic_node with fallback to host.name 1'] = {
  "type": "generic_node",
  "labels": {
    "location": "global",
    "namespace": "servicens",
    "node_id": "hostname"
  }
}

exports['mapOtelResourceToMonitoredResource should map to generic_task 1'] = {
  "type": "generic_task",
  "labels": {
    "location": "myavailzone",
    "namespace": "servicens",
    "job": "servicename",
    "task_id": "serviceinstanceid"
  }
}

exports['mapOtelResourceToMonitoredResource should map to generic_task with fallback to faas.instance 1'] = {
  "type": "generic_task",
  "labels": {
    "location": "myavailzone",
    "namespace": "servicens",
    "job": "servicename",
    "task_id": "myfaasinstance"
  }
}

exports['mapOtelResourceToMonitoredResource should map to generic_task with fallback to faas.name 1'] = {
  "type": "generic_task",
  "labels": {
    "location": "myavailzone",
    "namespace": "servicens",
    "job": "myfaasname",
    "task_id": "serviceinstanceid"
  }
}

exports['mapOtelResourceToMonitoredResource should map to generic_task with fallback to faas.name if service.name="unknown_service*" 1'] = {
  "type": "generic_task",
  "labels": {
    "location": "myregion",
    "namespace": "servicens",
    "job": "myfaasname",
    "task_id": "myfaasinstance"
  }
}

exports['mapOtelResourceToMonitoredResource should map to generic_task with fallback to global 1'] = {
  "type": "generic_task",
  "labels": {
    "location": "global",
    "namespace": "servicens",
    "job": "servicename",
    "task_id": "serviceinstanceid"
  }
}

exports['mapOtelResourceToMonitoredResource should map to generic_task with fallback to region 1'] = {
  "type": "generic_task",
  "labels": {
    "location": "myregion",
    "namespace": "servicens",
    "job": "servicename",
    "task_id": "serviceinstanceid"
  }
}

exports['mapOtelResourceToMonitoredResource should map to generic_task with unknown_service* if no better match found 1'] = {
  "type": "generic_task",
  "labels": {
    "location": "myavailzone",
    "namespace": "servicens",
    "job": "unknown_service:node",
    "task_id": "serviceinstanceid"
  }
}

exports['mapOtelResourceToMonitoredResource should map to k8s_cluster 1'] = {
  "type": "k8s_cluster",
  "labels": {
    "location": "myavailzone",
    "cluster_name": "mycluster"
  }
}

exports['mapOtelResourceToMonitoredResource should map to k8s_cluster with region fallback 1'] = {
  "type": "k8s_cluster",
  "labels": {
    "location": "myregion",
    "cluster_name": "mycluster"
  }
}

exports['mapOtelResourceToMonitoredResource should map to k8s_container 1'] = {
  "type": "k8s_container",
  "labels": {
    "location": "myavailzone",
    "cluster_name": "mycluster",
    "namespace_name": "myns",
    "pod_name": "mypod",
    "container_name": "mycontainer"
  }
}

exports['mapOtelResourceToMonitoredResource should map to k8s_container with region fallback 1'] = {
  "type": "k8s_container",
  "labels": {
    "location": "myregion",
    "cluster_name": "mycluster",
    "namespace_name": "myns",
    "pod_name": "mypod",
    "container_name": "mycontainer"
  }
}

exports['mapOtelResourceToMonitoredResource should map to k8s_node 1'] = {
  "type": "k8s_node",
  "labels": {
    "location": "myavailzone",
    "cluster_name": "mycluster",
    "node_name": "mynode"
  }
}

exports['mapOtelResourceToMonitoredResource should map to k8s_node with region fallback 1'] = {
  "type": "k8s_node",
  "labels": {
    "location": "myregion",
    "cluster_name": "mycluster",
    "node_name": "mynode"
  }
}

exports['mapOtelResourceToMonitoredResource should map to k8s_pod 1'] = {
  "type": "k8s_pod",
  "labels": {
    "location": "myavailzone",
    "cluster_name": "mycluster",
    "namespace_name": "myns",
    "pod_name": "mypod"
  }
}

exports['mapOtelResourceToMonitoredResource should map to k8s_pod with region fallback 1'] = {
  "type": "k8s_pod",
  "labels": {
    "location": "myregion",
    "cluster_name": "mycluster",
    "namespace_name": "myns",
    "pod_name": "mypod"
  }
}
