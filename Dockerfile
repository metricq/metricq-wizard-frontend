FROM node:19 AS builder
LABEL maintainer="mario.bielert@tu-dresden.de"

WORKDIR /wizard-frontend

COPY .yarn ./.yarn
COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn install --frozen-lockfile

ARG api_url
ENV API_URL=$api_url

ARG metricq_websocket_url
ENV METRICQ_WEBSOCKET_URL=$metricq_websocket_url

ARG metricq_webview_url
ENV METRICQ_WEBVIEW_URL=$metricq_webview_url


ARG node_env=production
ENV NODE_ENV=$node_env

COPY . ./

RUN NODE_OPTIONS=--openssl-legacy-provider yarn build

FROM nginx:alpine

COPY docker/nginx-default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /wizard-frontend/dist /usr/share/nginx/html
