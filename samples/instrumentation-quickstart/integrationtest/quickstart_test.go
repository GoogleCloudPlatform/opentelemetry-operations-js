// Copyright 2024 Google LLC
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

// Tests that docker compose services come up and that metrics, logs, and traces are
// successfully sent from the collector to GCP. See
// https://github.com/GoogleCloudPlatform/opentelemetry-operations-e2e-testing/blob/main/quickstarttest/README.md
// for details

package integrationtest

import (
	"testing"

	"github.com/GoogleCloudPlatform/opentelemetry-operations-e2e-testing/quickstarttest"
)

func TestApp(t *testing.T) {
	quickstarttest.InstrumentationQuickstartTest(t, "..")
}
