<template>
  <div>
    <b-row>
      <b-col>
        <h1>
          Cluster Topology
          <span class="lead">
            Gather information about the MetricQ Cluster
          </span>
        </h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-button variant="info" @click="updateTopology">
          <b-icon-arrow-repeat />
          Re-scan Cluster for active Clients
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-table
          ref="clustNodesTable"
          :items="clusterNodes"
          :fields="[
            { key: 'hostname', label: 'Host' },
            { key: 'clients', label: 'Seen Clients on Host' },
          ]"
          small
          primary-key="id"
          responsive="true"
          striped
          hover
        >
          <template #cell(clients)="data">
            <b-row
              v-for="client in data.item.clients"
              :key="client"
              class="container"
            >
              <b-col>
                {{ client._id }}
              </b-col>
              <source-actions :source="client" />
            </b-row>
          </template>
        </b-table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import SourceActions from '~/components/source_actions.vue'

export default {
  components: { SourceActions },
  layout: 'nonfluid',
  async asyncData({ $axios }) {
    const { data } = await $axios.get(`/topology`)

    return {
      clusterNodes: data,
    }
  },
  fetch() {},
  computed: {},
  methods: {
    async updateTopology() {
      await this.$axios.post(`/topology/discover`)
    },
  },
}
</script>

<style scoped>
#cluster-container {
  width: 100%;
  height: 10em;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
