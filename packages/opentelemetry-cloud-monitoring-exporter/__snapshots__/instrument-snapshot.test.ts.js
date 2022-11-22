exports['MetricExporter snapshot tests Counter - DOUBLE 1'] = [
  {
    "uri": "/v3/projects/otel-starter-project/metricDescriptors",
    "body": {
      "type": "custom.googleapis.com/opentelemetry/mycounter",
      "description": "counter description",
      "displayName": "OpenTelemetry/mycounter",
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
            "type": "custom.googleapis.com/opentelemetry/mycounter",
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
      "type": "custom.googleapis.com/opentelemetry/mycounter",
      "description": "counter description",
      "displayName": "OpenTelemetry/mycounter",
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
            "type": "custom.googleapis.com/opentelemetry/mycounter",
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
      "type": "custom.googleapis.com/opentelemetry/myhistogram",
      "description": "histogram description",
      "displayName": "OpenTelemetry/myhistogram",
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
            "type": "custom.googleapis.com/opentelemetry/myhistogram",
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
      "type": "custom.googleapis.com/opentelemetry/myhistogram",
      "description": "histogram description",
      "displayName": "OpenTelemetry/myhistogram",
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
            "type": "custom.googleapis.com/opentelemetry/myhistogram",
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
      "type": "custom.googleapis.com/opentelemetry/myobservablecounter",
      "description": "counter description",
      "displayName": "OpenTelemetry/myobservablecounter",
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
            "type": "custom.googleapis.com/opentelemetry/myobservablecounter",
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
      "type": "custom.googleapis.com/opentelemetry/myobservablecounter",
      "description": "counter description",
      "displayName": "OpenTelemetry/myobservablecounter",
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
            "type": "custom.googleapis.com/opentelemetry/myobservablecounter",
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
      "type": "custom.googleapis.com/opentelemetry/myobservablegauge",
      "description": "instrument description",
      "displayName": "OpenTelemetry/myobservablegauge",
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
            "type": "custom.googleapis.com/opentelemetry/myobservablegauge",
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
      "type": "custom.googleapis.com/opentelemetry/myobservablegauge",
      "description": "instrument description",
      "displayName": "OpenTelemetry/myobservablegauge",
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
            "type": "custom.googleapis.com/opentelemetry/myobservablegauge",
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
      "type": "custom.googleapis.com/opentelemetry/myobservableupdowncounter",
      "description": "instrument description",
      "displayName": "OpenTelemetry/myobservableupdowncounter",
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
            "type": "custom.googleapis.com/opentelemetry/myobservableupdowncounter",
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
      "type": "custom.googleapis.com/opentelemetry/myobservableupdowncounter",
      "description": "instrument description",
      "displayName": "OpenTelemetry/myobservableupdowncounter",
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
            "type": "custom.googleapis.com/opentelemetry/myobservableupdowncounter",
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
      "type": "custom.googleapis.com/opentelemetry/myupdowncounter",
      "description": "updowncounter description",
      "displayName": "OpenTelemetry/myupdowncounter",
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
            "type": "custom.googleapis.com/opentelemetry/myupdowncounter",
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
      "type": "custom.googleapis.com/opentelemetry/myupdowncounter",
      "description": "updowncounter description",
      "displayName": "OpenTelemetry/myupdowncounter",
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
            "type": "custom.googleapis.com/opentelemetry/myupdowncounter",
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
