<template>
  <div class="metricLibrary">
    <b-row>
      <b-col>
        <h1>
          {{ clientId }} 🔬
          <span class="lead">Client Details</span>
        </h1>
      </b-col>
    </b-row>

    <b-row>
      <b-col align="center">
        <b-card no-body>
          <b-card-header align="right">
            <client-actions
              v-if="client"
              :show-details="false"
              :client="client"
            />
          </b-card-header>

          <b-tabs>
            <b-tab title="Details">
              {{ client }}
            </b-tab>
            <b-tab title="Consumed Metrics"></b-tab>
            <b-tab title="Produced Metrics"></b-tab>
          </b-tabs>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import ClientActions from '~/components/client_actions.vue'
import Source from '~/models/Source'
import Client from '~/models/Client'

export default {
  components: { ClientActions },
  asyncComputed: {
    async client() {
      return await Client.find(this.clientId)
    },
  },
  asyncData({ params }) {
    return {
      clientId: params.clientId,
    }
  },
  async fetch() {
    Client.commit((state) => {
      state.fetching = true
    })
    Source.commit((state) => {
      state.fetching = true
    })

    await Source.api().get('/sources')
    await Client.api().get('/clients/active', { persistsBy: 'insert' })
    await Client.api().get('/clients', { persistsBy: 'insert' })

    Source.commit((state) => {
      state.fetching = false
    })
    Client.commit((state) => {
      state.fetching = false
    })
  },
  computed: {},

  methods: {},
}
</script>

<style scoped></style>
