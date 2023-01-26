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

          <b-card-body v-if="client">
            <b-card no-body>
              <b-row v-if="client.discoverTime">
                <b-col v-if="client.hostname" align="left" class="m-3">
                  Runs on {{ client.hostname }}
                  <span v-if="client.version">
                    (Version {{ client.version }})
                  </span>
                  <span v-if="client.metricqVersion">
                    using MetricQ {{ client.metricqVersion }}
                  </span>
                </b-col>
              </b-row>
              <b-alert v-else variant="warning" show class="mb-0">
                Client has never been seen in discovery. No details available.
              </b-alert>
            </b-card>

            <b-row class="mt-4">
              <b-col>
                <metric-list-card
                  v-if="consumedMetrics !== null"
                  :metrics="consumedMetrics"
                  title="Consumed Metrics"
                  empty-message="No consumed metrics."
                />
                <b-card v-else no-body header="Consumed Metrics">
                  <b-list-group flush align="left">
                    <b-list-group-item>
                      <b-skeleton width="85%" />
                    </b-list-group-item>
                    <b-list-group-item>
                      <b-skeleton width="55%" />
                    </b-list-group-item>
                    <b-list-group-item>
                      <b-skeleton width="70%" />
                    </b-list-group-item>
                  </b-list-group>
                </b-card>
              </b-col>
              <b-col>
                <metric-list-card
                  v-if="producedMetrics !== null"
                  :metrics="producedMetrics"
                  title="Produced Metrics"
                  empty-message="No produced metrics."
                />
                <div
                  v-else
                  no-body
                  header="Produced Metrics"
                  class="text-center m-3"
                >
                  <span class="lead">Loading...</span
                  ><b-spinner type="grow" label="Loading..." />
                </div>
              </b-col>
            </b-row>
          </b-card-body>
          <b-card-body v-else class="p-0">
            <b-alert variant="warning" show class="p-3 m-0">
              Could not find any information about this client. Maybe it does
              not exist.
            </b-alert>
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
      Client.fetchAll(),
      async () => {
        const { data } = await this.$axios.get(
          `/client/${this.clientId}/consumed_metrics`
        )
        this.consumedMetrics = data
      },
      async () => {
        const { data } = await this.$axios.get(
          `/client/${this.clientId}/produced_metrics`
        )
        this.producedMetrics = data
      },
    ])

    this.client = await Client.find(this.clientId)
  },
}
</script>

<style scoped></style>
