exports['MetricExporter snapshot tests Counter - DOUBLE 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/mycounter",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/mycounter",
      "description": "counter description",
      "displayName": "mycounter",
      "metricKind": "CUMULATIVE",
      "valueType": "DOUBLE",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "string",
          "description": ""
        },
        {
          "key": "int",
          "description": ""
        },
        {
          "key": "float",
          "description": ""
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/mycounter",
            "labels": {
              "string": "string",
              "int": "123",
              "float": "123.4"
            }
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "CUMULATIVE",
          "valueType": "DOUBLE",
          "points": [
            {
              "value": {
                "doubleValue": 12.3
              },
              "interval": {
                "startTime": "startTime",
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests Counter - INT 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/mycounter",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/mycounter",
      "description": "counter description",
      "displayName": "mycounter",
      "metricKind": "CUMULATIVE",
      "valueType": "INT64",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "string",
          "description": ""
        },
        {
          "key": "int",
          "description": ""
        },
        {
          "key": "float",
          "description": ""
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/mycounter",
            "labels": {
              "string": "string",
              "int": "123",
              "float": "123.4"
            }
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "CUMULATIVE",
          "valueType": "INT64",
          "points": [
            {
              "value": {
                "int64Value": "10"
              },
              "interval": {
                "startTime": "startTime",
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests Custom User Agent correctly adds a custom user agent when one is specified 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/mycounter",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 myProduct/myVersion google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/mycounter",
      "description": "description",
      "displayName": "mycounter",
      "metricKind": "CUMULATIVE",
      "valueType": "INT64",
      "unit": "unit",
      "labels": []
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 myProduct/myVersion google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/mycounter",
            "labels": {}
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "CUMULATIVE",
          "valueType": "INT64",
          "points": [
            {
              "value": {
                "int64Value": "1"
              },
              "interval": {
                "startTime": "startTime",
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 myProduct/myVersion google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests Histogram - DOUBLE 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/myhistogram",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myhistogram",
      "description": "histogram description",
      "displayName": "myhistogram",
      "metricKind": "CUMULATIVE",
      "valueType": "DISTRIBUTION",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "string",
          "description": ""
        },
        {
          "key": "int",
          "description": ""
        },
        {
          "key": "float",
          "description": ""
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/myhistogram",
            "labels": {
              "string": "string",
              "int": "123",
              "float": "123.4"
            }
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "CUMULATIVE",
          "valueType": "DISTRIBUTION",
          "points": [
            {
              "value": {
                "distributionValue": {
                  "count": "1",
                  "mean": 12.3,
                  "bucketOptions": {
                    "explicitBuckets": {
                      "bounds": [
                        0,
                        5,
                        10,
                        25,
                        50,
                        75,
                        100,
                        250,
                        500,
                        750,
                        1000,
                        2500,
                        5000,
                        7500,
                        10000
                      ]
                    }
                  },
                  "bucketCounts": [
                    "0",
                    "0",
                    "0",
                    "1",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0"
                  ]
                }
              },
              "interval": {
                "startTime": "startTime",
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests Histogram - INT 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/myhistogram",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myhistogram",
      "description": "histogram description",
      "displayName": "myhistogram",
      "metricKind": "CUMULATIVE",
      "valueType": "DISTRIBUTION",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "string",
          "description": ""
        },
        {
          "key": "int",
          "description": ""
        },
        {
          "key": "float",
          "description": ""
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/myhistogram",
            "labels": {
              "string": "string",
              "int": "123",
              "float": "123.4"
            }
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "CUMULATIVE",
          "valueType": "DISTRIBUTION",
          "points": [
            {
              "value": {
                "distributionValue": {
                  "count": "1",
                  "mean": 10,
                  "bucketOptions": {
                    "explicitBuckets": {
                      "bounds": [
                        0,
                        5,
                        10,
                        25,
                        50,
                        75,
                        100,
                        250,
                        500,
                        750,
                        1000,
                        2500,
                        5000,
                        7500,
                        10000
                      ]
                    }
                  },
                  "bucketCounts": [
                    "0",
                    "0",
                    "1",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0"
                  ]
                }
              },
              "interval": {
                "startTime": "startTime",
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests ObservableCounter - DOUBLE 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/myobservablecounter",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myobservablecounter",
      "description": "counter description",
      "displayName": "myobservablecounter",
      "metricKind": "CUMULATIVE",
      "valueType": "DOUBLE",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "string",
          "description": ""
        },
        {
          "key": "int",
          "description": ""
        },
        {
          "key": "float",
          "description": ""
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/myobservablecounter",
            "labels": {
              "string": "string",
              "int": "123",
              "float": "123.4"
            }
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "CUMULATIVE",
          "valueType": "DOUBLE",
          "points": [
            {
              "value": {
                "doubleValue": 12.3
              },
              "interval": {
                "startTime": "startTime",
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests ObservableCounter - INT 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/myobservablecounter",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myobservablecounter",
      "description": "counter description",
      "displayName": "myobservablecounter",
      "metricKind": "CUMULATIVE",
      "valueType": "INT64",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "string",
          "description": ""
        },
        {
          "key": "int",
          "description": ""
        },
        {
          "key": "float",
          "description": ""
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/myobservablecounter",
            "labels": {
              "string": "string",
              "int": "123",
              "float": "123.4"
            }
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "CUMULATIVE",
          "valueType": "INT64",
          "points": [
            {
              "value": {
                "int64Value": "10"
              },
              "interval": {
                "startTime": "startTime",
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests ObservableGauge - DOUBLE 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/myobservablegauge",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myobservablegauge",
      "description": "instrument description",
      "displayName": "myobservablegauge",
      "metricKind": "GAUGE",
      "valueType": "DOUBLE",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "string",
          "description": ""
        },
        {
          "key": "int",
          "description": ""
        },
        {
          "key": "float",
          "description": ""
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/myobservablegauge",
            "labels": {
              "string": "string",
              "int": "123",
              "float": "123.4"
            }
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "GAUGE",
          "valueType": "DOUBLE",
          "points": [
            {
              "value": {
                "doubleValue": 12.3
              },
              "interval": {
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests ObservableGauge - INT 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/myobservablegauge",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myobservablegauge",
      "description": "instrument description",
      "displayName": "myobservablegauge",
      "metricKind": "GAUGE",
      "valueType": "INT64",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "string",
          "description": ""
        },
        {
          "key": "int",
          "description": ""
        },
        {
          "key": "float",
          "description": ""
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/myobservablegauge",
            "labels": {
              "string": "string",
              "int": "123",
              "float": "123.4"
            }
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "GAUGE",
          "valueType": "INT64",
          "points": [
            {
              "value": {
                "int64Value": "10"
              },
              "interval": {
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests ObservableUpDownCounter - DOUBLE 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/myobservableupdowncounter",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myobservableupdowncounter",
      "description": "instrument description",
      "displayName": "myobservableupdowncounter",
      "metricKind": "GAUGE",
      "valueType": "DOUBLE",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "string",
          "description": ""
        },
        {
          "key": "int",
          "description": ""
        },
        {
          "key": "float",
          "description": ""
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/myobservableupdowncounter",
            "labels": {
              "string": "string",
              "int": "123",
              "float": "123.4"
            }
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "GAUGE",
          "valueType": "DOUBLE",
          "points": [
            {
              "value": {
                "doubleValue": 12.3
              },
              "interval": {
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests ObservableUpDownCounter - INT 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/myobservableupdowncounter",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myobservableupdowncounter",
      "description": "instrument description",
      "displayName": "myobservableupdowncounter",
      "metricKind": "GAUGE",
      "valueType": "INT64",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "string",
          "description": ""
        },
        {
          "key": "int",
          "description": ""
        },
        {
          "key": "float",
          "description": ""
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/myobservableupdowncounter",
            "labels": {
              "string": "string",
              "int": "123",
              "float": "123.4"
            }
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "GAUGE",
          "valueType": "INT64",
          "points": [
            {
              "value": {
                "int64Value": "10"
              },
              "interval": {
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests UpDownCounter - DOUBLE 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/myupdowncounter",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myupdowncounter",
      "description": "updowncounter description",
      "displayName": "myupdowncounter",
      "metricKind": "GAUGE",
      "valueType": "DOUBLE",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "string",
          "description": ""
        },
        {
          "key": "int",
          "description": ""
        },
        {
          "key": "float",
          "description": ""
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/myupdowncounter",
            "labels": {
              "string": "string",
              "int": "123",
              "float": "123.4"
            }
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "GAUGE",
          "valueType": "DOUBLE",
          "points": [
            {
              "value": {
                "doubleValue": 12.3
              },
              "interval": {
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests UpDownCounter - INT 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/myupdowncounter",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myupdowncounter",
      "description": "updowncounter description",
      "displayName": "myupdowncounter",
      "metricKind": "GAUGE",
      "valueType": "INT64",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "string",
          "description": ""
        },
        {
          "key": "int",
          "description": ""
        },
        {
          "key": "float",
          "description": ""
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/myupdowncounter",
            "labels": {
              "string": "string",
              "int": "123",
              "float": "123.4"
            }
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "GAUGE",
          "valueType": "INT64",
          "points": [
            {
              "value": {
                "int64Value": "10"
              },
              "interval": {
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests normalizes label keys in metric and descriptor 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/mycounter",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/mycounter",
      "description": "instrument description",
      "displayName": "mycounter",
      "metricKind": "CUMULATIVE",
      "valueType": "INT64",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "key_123",
          "description": ""
        },
        {
          "key": "valid_key_1",
          "description": ""
        },
        {
          "key": "hellø",
          "description": ""
        },
        {
          "key": "key_321",
          "description": ""
        },
        {
          "key": "hyphens_dots_slashes_",
          "description": ""
        },
        {
          "key": "non_letters______",
          "description": ""
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/mycounter",
            "labels": {
              "key_123": "key_123",
              "valid_key_1": "valid_key_1",
              "hellø": "hellø",
              "key_321": "key_321",
              "hyphens_dots_slashes_": "hyphens_dots_slashes_",
              "non_letters______": "non_letters______"
            }
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "CUMULATIVE",
          "valueType": "INT64",
          "points": [
            {
              "value": {
                "int64Value": "1"
              },
              "interval": {
                "startTime": "startTime",
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests reconfigure with views ExponentialHistogram histogram with ExponentialHistogram view and only underflow observations 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/myexphist",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myexphist",
      "description": "instrument description",
      "displayName": "myexphist",
      "metricKind": "CUMULATIVE",
      "valueType": "DISTRIBUTION",
      "unit": "{myunit}",
      "labels": []
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/myexphist",
            "labels": {}
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "CUMULATIVE",
          "valueType": "DISTRIBUTION",
          "points": [
            {
              "value": {
                "distributionValue": {
                  "count": "1",
                  "mean": 0,
                  "bucketOptions": {
                    "explicitBuckets": {
                      "bounds": []
                    }
                  },
                  "bucketCounts": [
                    "1",
                    "0"
                  ]
                }
              },
              "interval": {
                "startTime": "startTime",
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests reconfigure with views ExponentialHistogram histogram with ExponentialHistogram view and several observations 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/myexphist",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myexphist",
      "description": "instrument description",
      "displayName": "myexphist",
      "metricKind": "CUMULATIVE",
      "valueType": "DISTRIBUTION",
      "unit": "{myunit}",
      "labels": []
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/myexphist",
            "labels": {}
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "CUMULATIVE",
          "valueType": "DISTRIBUTION",
          "points": [
            {
              "value": {
                "distributionValue": {
                  "count": "1001",
                  "mean": 499.124325674332,
                  "bucketOptions": {
                    "exponentialBuckets": {
                      "growthFactor": 1.0905077326652577,
                      "scale": 0.11462550540058382,
                      "numFiniteBuckets": 105
                    }
                  },
                  "bucketCounts": [
                    "1",
                    "1",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "1",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "0",
                    "1",
                    "0",
                    "0",
                    "0",
                    "0",
                    "1",
                    "0",
                    "0",
                    "1",
                    "0",
                    "1",
                    "0",
                    "1",
                    "0",
                    "1",
                    "0",
                    "1",
                    "1",
                    "1",
                    "1",
                    "1",
                    "1",
                    "1",
                    "1",
                    "2",
                    "1",
                    "2",
                    "2",
                    "2",
                    "2",
                    "3",
                    "2",
                    "3",
                    "3",
                    "4",
                    "4",
                    "4",
                    "4",
                    "5",
                    "5",
                    "6",
                    "6",
                    "7",
                    "8",
                    "8",
                    "9",
                    "10",
                    "10",
                    "12",
                    "13",
                    "13",
                    "15",
                    "17",
                    "18",
                    "19",
                    "21",
                    "24",
                    "25",
                    "27",
                    "30",
                    "33",
                    "36",
                    "39",
                    "42",
                    "47",
                    "50",
                    "55",
                    "60",
                    "66",
                    "71",
                    "78",
                    "61",
                    "0"
                  ]
                }
              },
              "interval": {
                "startTime": "startTime",
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests reconfigure with views counter with histogram view 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors/workload.googleapis.com/mycounter",
    "body": {},
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/mycounter",
      "description": "instrument description",
      "displayName": "mycounter",
      "metricKind": "CUMULATIVE",
      "valueType": "DOUBLE",
      "unit": "{myunit}",
      "labels": []
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/mycounter",
            "labels": {}
          },
          "resource": {
            "type": "generic_node",
            "labels": {
              "location": "global",
              "namespace": "",
              "node_id": ""
            }
          },
          "metricKind": "CUMULATIVE",
          "valueType": "DOUBLE",
          "points": [
            {
              "value": {
                "doubleValue": 12.3
              },
              "interval": {
                "startTime": "startTime",
                "endTime": "endTime"
              }
            }
          ]
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/2.0.0 google-cloud-metric-exporter/0.20.0 google-api-nodejs-client/7.2.0 (gzip)"
    ]
  }
]
