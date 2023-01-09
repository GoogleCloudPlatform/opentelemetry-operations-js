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

#### Base image stage
FROM node:19-alpine as node-base
ENV SRC="/src"
WORKDIR $SRC

#### Build stage
# Workaround for docker not keep directory structure with glob COPY. This avoids invalidating
# the cache.
FROM node-base as packagejsons
COPY packages/ packages-tmp/
RUN mkdir packages/ && cd packages-tmp && cp --parents **/package*.json ../packages/

#### Build stage
FROM node-base as build
# Install dev tools in the root of the repo
COPY lerna.json package.json package-lock.json ./
RUN npm install --ignore-scripts
# Bootstrap local deps before compiling or copying in source
COPY --from=packagejsons $SRC/packages/ packages/
RUN npx lerna bootstrap --ignore-scripts
# Copy in and build local deps
COPY scripts/ scripts/
COPY packages/ packages/
RUN npx lerna run --no-private compile
# Copy in e2e-test-server source and build server with the local source. Don't use lerna since
# we don't want symlinks.
WORKDIR $SRC/e2e-test-server/
COPY e2e-test-server/package*.json ./
RUN npm install --ignore-scripts ../packages/*
COPY e2e-test-server/ .
# compile and deletes unneeded dev deps
RUN npm run compile

#### Actual image stage
FROM node-base
USER node
COPY --from=build --chown=node:node $SRC/e2e-test-server .
ENTRYPOINT ["node", "build/src/index.js"]
