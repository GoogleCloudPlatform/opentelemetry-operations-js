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
# copy local dependencies
COPY lerna.json package.json package-lock.json ./
# Install dev tools in the root of the repo
RUN npm install --ignore-scripts
COPY . ./
# bootstrap only the packages needed for e2e test server
RUN npx lerna@latest bootstrap --scope=@google-cloud/e2e-test-server --include-dependencies
# dereference lerna symlinks so we don't need to copy out the whole monorepo
RUN TMPDIR=$(mktemp -d) && \
    cp --dereference --recursive e2e-test-server/node_modules/@google-cloud $TMPDIR/ && \
    rm -rf e2e-test-server/node_modules/@google-cloud && \
    mv $TMPDIR/@google-cloud e2e-test-server/node_modules/@google-cloud
RUN npm prune --omit=dev

FROM node-base
USER node
COPY --from=build-base --chown=node:node $SRC/e2e-test-server ./
ENTRYPOINT ["node", "build/src/index.js"]
