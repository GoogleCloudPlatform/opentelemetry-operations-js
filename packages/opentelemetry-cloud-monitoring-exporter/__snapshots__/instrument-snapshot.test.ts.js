exports['MetricExporter snapshot tests counter 1'] = [
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
      "opentelemetry-js/1.8.0 google-cloud-metric-exporter/0.14.0 google-api-nodejs-client/5.1.0 (gzip)"
    ]
  }
]
