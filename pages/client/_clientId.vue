<template>
  <div class="metricLibrary">
    <b-row>
      <b-col>
        <h1>
          Client Details 🔬
          <span class="lead"
            >Shows discovery data, consumed and produced metrics
          </span>
        </h1>
      </b-col>
    </b-row>

    <b-row>
      <b-col align="center">
        <b-card no-body>
          <b-card-header align="left">
            <b-row>
              <b-col>
                <span class="lead">
                  {{ clientId }}
                </span>
              </b-col>
              <b-col>
                <client-actions
                  v-if="client"
                  :show-details="false"
                  :client="client"
                />
              </b-col>
            </b-row>
          </b-card-header>
          <b-card-body v-if="$fetchState.pending" class="p-0 text-center">
            <b-alert variant="info" show class="p-3 m-0">
              <b-spinner
                varian="primary"
                label="Loading data..."
                class="mr-2"
              />
              Loading data...
            </b-alert>
          </b-card-body>
          <b-card-body v-else>
            <b-card no-body>
              <b-row v-if="client.discoverTime">
                <b-col v-if="client.hostname" align="left" class="m-3">
                  Runs on {{ client.hostname }}
                  <template v-if="client.version">
                    (Version {{ client.version }})
                  </template>
                  <template v-if="client.metricqVersion">
                    using MetricQ {{ client.metricqVersion }}
                  </template>
                </b-col>
              </b-row>
              <b-alert v-else variant="warning" show class="mb-0">
                Client has never been seen in discovery. No details available.
              </b-alert>
            </b-card>

            <b-row class="mt-4">
              <b-col>
                <metric-list-card
                  :metrics="consumedMetrics"
                  title="Consumed Metrics"
                  empty-message="No consumed metrics."
                />
              </b-col>
              <b-col>
                <metric-list-card
                  :metrics="producedMetrics"
                  title="Produced Metrics"
                  empty-message="No produced metrics."
                />
              </b-col>
            </b-row>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import ClientActions from '~/components/ClientActions'
import Client from '~/models/Client'
import MetricListCard from '~/components/MetricListCard'

export default {
  components: { MetricListCard, ClientActions },
  asyncData({ params }) {
    return {
      clientId: params.clientId,
      client: null,
      producedMetrics: [],
      consumedMetrics: [],
    }
  },
  async fetch() {
    await Promise.all([
      Client.fetchProducedMetrics(this.clientId).then(
        (data) => (this.producedMetrics = data)
      ),
      Client.fetchConsumedMetrics(this.clientId).then(
        (data) => (this.consumedMetrics = data)
      ),
      Client.fetchAll(),
    ])

    this.client = await Client.find(this.clientId)
  },
}
</script>

<style scoped></style>
