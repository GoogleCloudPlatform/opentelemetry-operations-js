FROM node:20-alpine as builder
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm install --ignore-scripts
COPY . ./
RUN npm run compile

FROM node:20-alpine
RUN chown node:node /var/log
USER node
WORKDIR /src
COPY --chown=node --from=builder /src ./
# [START opentelemetry_instrumentation_agent_dockerfile]
CMD node --require ./build/src/instrumentation.js build/src/index.js 2>&1 | tee /var/log/app.log
# [END opentelemetry_instrumentation_agent_dockerfile]
