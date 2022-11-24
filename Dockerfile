FROM node:19 AS builder
LABEL maintainer="franz.hoepfner@tu-dresden.de"

WORKDIR /wizard-frontend

COPY .yarn ./.yarn
COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn install --frozen-lockfile

ARG api_url
ENV API_URL=$api_url

COPY . ./

RUN NODE_OPTIONS=--openssl-legacy-provider yarn build

FROM nginx:alpine

COPY --from=builder /wizard-frontend/dist /usr/share/nginx/html
