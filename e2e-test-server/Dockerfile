# Copyright 2021 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Build relative to root of repository i.e. `docker build --file Dockerfile --tag=$tag ..`

FROM node:19-alpine as node-base
ENV SRC="/src"
WORKDIR $SRC

FROM node-base as build-base
COPY . ./
# bootstrap and compile only the packages needed for e2e test server
RUN npm install --workspace=./e2e-test-server
RUN npx lerna@^7 run compile --scope=@google-cloud/e2e-test-server --include-dependencies
# builds a small self contained bundle with @vercel/ncc under dist/
RUN cd e2e-test-server && npm run bundle

FROM node-base
USER node
COPY --from=build-base --chown=node:node $SRC/e2e-test-server/dist ./
ENTRYPOINT ["node", "index.js"]
