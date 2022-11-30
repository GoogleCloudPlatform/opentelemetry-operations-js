exports['MetricExporter snapshot tests Counter - DOUBLE 1'] = [
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
          "key": "opentelemetry_task",
          "description": "OpenTelemetry task identifier"
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
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
              "float": "123.4",
              "opentelemetry_task": "opentelemetry_task"
            }
          },
          "resource": {
            "type": "global",
            "labels": {
              "project_id": "otel-starter-project"
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
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests Counter - INT 1'] = [
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
          "key": "opentelemetry_task",
          "description": "OpenTelemetry task identifier"
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
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
              "float": "123.4",
              "opentelemetry_task": "opentelemetry_task"
            }
          },
          "resource": {
            "type": "global",
            "labels": {
              "project_id": "otel-starter-project"
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
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests Histogram - DOUBLE 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myhistogram",
      "description": "histogram description",
      "displayName": "myhistogram",
      "metricKind": "CUMULATIVE",
      "valueType": "DOUBLE",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "opentelemetry_task",
          "description": "OpenTelemetry task identifier"
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
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
              "float": "123.4",
              "opentelemetry_task": "opentelemetry_task"
            }
          },
          "resource": {
            "type": "global",
            "labels": {
              "project_id": "otel-starter-project"
            }
          },
          "metricKind": "CUMULATIVE",
          "valueType": "DOUBLE",
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
                        1000
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
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests Histogram - INT 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myhistogram",
      "description": "histogram description",
      "displayName": "myhistogram",
      "metricKind": "CUMULATIVE",
      "valueType": "INT64",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "opentelemetry_task",
          "description": "OpenTelemetry task identifier"
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
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
              "float": "123.4",
              "opentelemetry_task": "opentelemetry_task"
            }
          },
          "resource": {
            "type": "global",
            "labels": {
              "project_id": "otel-starter-project"
            }
          },
          "metricKind": "CUMULATIVE",
          "valueType": "INT64",
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
                        1000
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
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests ObservableCounter - DOUBLE 1'] = [
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
          "key": "opentelemetry_task",
          "description": "OpenTelemetry task identifier"
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
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
              "float": "123.4",
              "opentelemetry_task": "opentelemetry_task"
            }
          },
          "resource": {
            "type": "global",
            "labels": {
              "project_id": "otel-starter-project"
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
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests ObservableCounter - INT 1'] = [
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
          "key": "opentelemetry_task",
          "description": "OpenTelemetry task identifier"
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
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
              "float": "123.4",
              "opentelemetry_task": "opentelemetry_task"
            }
          },
          "resource": {
            "type": "global",
            "labels": {
              "project_id": "otel-starter-project"
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
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests ObservableGauge - DOUBLE 1'] = [
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
          "key": "opentelemetry_task",
          "description": "OpenTelemetry task identifier"
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
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
              "float": "123.4",
              "opentelemetry_task": "opentelemetry_task"
            }
          },
          "resource": {
            "type": "global",
            "labels": {
              "project_id": "otel-starter-project"
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
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests ObservableGauge - INT 1'] = [
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
          "key": "opentelemetry_task",
          "description": "OpenTelemetry task identifier"
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
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
              "float": "123.4",
              "opentelemetry_task": "opentelemetry_task"
            }
          },
          "resource": {
            "type": "global",
            "labels": {
              "project_id": "otel-starter-project"
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
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests ObservableUpDownCounter - DOUBLE 1'] = [
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
          "key": "opentelemetry_task",
          "description": "OpenTelemetry task identifier"
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
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
              "float": "123.4",
              "opentelemetry_task": "opentelemetry_task"
            }
          },
          "resource": {
            "type": "global",
            "labels": {
              "project_id": "otel-starter-project"
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
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests ObservableUpDownCounter - INT 1'] = [
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
          "key": "opentelemetry_task",
          "description": "OpenTelemetry task identifier"
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
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
              "float": "123.4",
              "opentelemetry_task": "opentelemetry_task"
            }
          },
          "resource": {
            "type": "global",
            "labels": {
              "project_id": "otel-starter-project"
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
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests UpDownCounter - DOUBLE 1'] = [
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
          "key": "opentelemetry_task",
          "description": "OpenTelemetry task identifier"
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
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
              "float": "123.4",
              "opentelemetry_task": "opentelemetry_task"
            }
          },
          "resource": {
            "type": "global",
            "labels": {
              "project_id": "otel-starter-project"
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
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests UpDownCounter - INT 1'] = [
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
          "key": "opentelemetry_task",
          "description": "OpenTelemetry task identifier"
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
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
              "float": "123.4",
              "opentelemetry_task": "opentelemetry_task"
            }
          },
          "resource": {
            "type": "global",
            "labels": {
              "project_id": "otel-starter-project"
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
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  }
]

exports['MetricExporter snapshot tests reconfigure with views counter with histogram view 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "workload.googleapis.com/myrenamedhistogram",
      "description": "instrument description",
      "displayName": "myrenamedhistogram",
      "metricKind": "CUMULATIVE",
      "valueType": "DOUBLE",
      "unit": "{myunit}",
      "labels": [
        {
          "key": "opentelemetry_task",
          "description": "OpenTelemetry task identifier"
        }
      ]
    },
    "userAgent": [
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  },
  {
    "uri": "/v3/projects/otel-starter-project/timeSeries",
    "body": {
      "timeSeries": [
        {
          "metric": {
            "type": "workload.googleapis.com/myrenamedhistogram",
            "labels": {
              "opentelemetry_task": "opentelemetry_task"
            }
          },
          "resource": {
            "type": "global",
            "labels": {
              "project_id": "otel-starter-project"
            }
          },
          "metricKind": "CUMULATIVE",
          "valueType": "DOUBLE",
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
                        1000
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
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  }
]
