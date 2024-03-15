# OpenTelemetry Fastify instrumentation example

> [!NOTE]  
> This sample is not an npm workspace within this repo. It does not link in any dependencies
> from this repo and all commands should be run directly from this directory.

This sample is a [Fastify](https://fastify.dev/) Node.js application instrumented with
[OpenTelemetry JS auto instrumentation](https://opentelemetry.io/docs/languages/js/automatic/).
This is a Node.js version of [this golang
sample](https://github.com/GoogleCloudPlatform/golang-samples/tree/main/opentelemetry/instrumentation).
It uses docker compose to orchestrate running the application and sending it some requests.

The code is a basic Fastify application with two endpoints
- `/multi` makes a few requests to `/single` on localhost
- `/single` sleeps for a short time to simulate work

Docker compose also runs the OpenTelemetry collector, set up to receive telemetry from the
application and parse its logs from a shared volume. Finally, a loadgen container sends
requests to the app.

## Permissions

This sample writes to Cloud Logging, Cloud Monitoring, and Cloud Trace. Grant yourself the
following roles to run the example:
- `roles/logging.logWriter` – see https://cloud.google.com/logging/docs/access-control#permissions_and_roles
- `roles/monitoring.metricWriter` – see https://cloud.google.com/monitoring/access-control#predefined_roles
- `roles/cloudtrace.agent` – see https://cloud.google.com/trace/docs/iam#trace-roles

## Running the example

### Cloud Shell or GCE

```sh
git clone https://github.com/GoogleCloudPlatform/opentelemetry-operations-js.git
cd opentelemetry-operations-js/samples/instrumentation-quickstart
docker compose up --abort-on-container-exit
```

### Locally with Application Default Credentials

First Create local credentials by running the following command and following the
oauth2 flow (read more about the command [here][auth_command]):

	gcloud auth application-default login

Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable with `export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/gcloud/application_default_credentials.json"`
or manually set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to a service
account key JSON file path.

Learn more at [Setting Up Authentication for Server to Server Production Applications][ADC].

*Note:* Application Default Credentials is able to implicitly find the credentials as long as the application is running on Compute Engine, Kubernetes Engine, App Engine, or Cloud Functions.

Then run the example:

```sh
git clone https://github.com/GoogleCloudPlatform/opentelemetry-operations-js.git
cd opentelemetry-operations-js/samples/instrumentation-quickstart

# Lets collector read mounted config
export USERID="$(id -u)"
# Specify the project ID
export GOOGLE_CLOUD_PROJECT=<your project id>
docker compose -f docker-compose.yaml -f docker-compose.creds.yaml up  --abort-on-container-exit
```

[auth_command]: https://cloud.google.com/sdk/gcloud/reference/beta/auth/application-default/login
