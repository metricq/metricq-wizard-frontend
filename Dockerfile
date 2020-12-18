FROM node:alpine
LABEL maintainer="franz.hoepfner@tu-dresden.de"

RUN addgroup -S metricq && adduser -S metricq -G metricq
RUN apk add --no-cache libc6-compat python3 make gcc build-base

USER metricq
COPY --chown=metricq:metricq . /home/metricq/wizard-frontend

WORKDIR /home/metricq/wizard-frontend

ARG api_url
ENV API_URL=$api_url
RUN yarn install && yarn build

EXPOSE 3000
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

CMD [ "yarn", "start" ]
