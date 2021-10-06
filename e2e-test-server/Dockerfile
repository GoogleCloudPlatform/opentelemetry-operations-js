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

FROM node:16-alpine as node-base
ENV SRC="/src"
RUN npm install -g npm@^7
USER node
WORKDIR $SRC

FROM node-base as build-base
USER root
RUN chown node:node $SRC
USER node
# copy local dependencies
COPY --chown=node:node packages/ packages/
COPY --chown=node:node scripts/ scripts/
COPY --chown=node:node lerna.json package.json package-lock.json ./
# copy package.json
COPY --chown=node:node e2e-test-server/package.json e2e-test-server/package-lock.json e2e-test-server/
# bootstrap without compile
RUN npx lerna bootstrap --ignore-scripts
# compile everything BUT e2e-test-server
RUN npx lerna run compile --ignore @google-cloud/e2e-test-server
# dereference lerna symlinks so we don't need to copy out the whole monorepo
RUN TMPDIR=$(mktemp -d) && \
    cp --dereference --recursive e2e-test-server/node_modules/@google-cloud $TMPDIR/ && \
    rm -rf e2e-test-server/node_modules/@google-cloud && \
    mv $TMPDIR/@google-cloud e2e-test-server/node_modules/@google-cloud

FROM node-base
COPY --from=build-base --chown=node:node $SRC/e2e-test-server $SRC/e2e-test-server/
WORKDIR $SRC/e2e-test-server
COPY --chown=node:node e2e-test-server/ ./
RUN npm run compile
ENTRYPOINT ["node", "build/src/index.js"]
