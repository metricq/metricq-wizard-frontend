# metricq-wizard-frontend

> A configuration web app for MetricQ

## Build Setup

``` bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For a detailed explanation of how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## Deployment using Docker container

Build the Docker image using the `Dockerfile` and provide the two **build** arguments:

- `api_url` -- the URL to the wizard-backend, including the `/api` 
- `metricq_websocket_url` -- the URL to the websocket endpoint used to retrieve live data

For example, this builds an image usable with the local development setup using the
docker-compose-development.yml from the metricq/metricq repository:

```bash
docker build -t metricq-wizard-frontend  --build-arg api_url=http://localhost:8000/api --build-arg metricq_websocket_url=ws://localhost:3003 .
```

Once you built your image, you can run it:

```bash
docker run -it --rm -p3000:80 metricq-wizard-frontend
```

Note: The front end gets served by an nginx server instance running in the docker container, listening on port 80.
For an actual production setup, you'd want to have a proxy server and TLS end point in front of that.
