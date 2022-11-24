<template>
  <div>
    <b-row>
      <b-col>
        <h1>Cluster Topology</h1>
      </b-col>
      <b-col>
        <b-button class="float-right" variant="info" @click="updateTopology">
          <b-icon-arrow-repeat></b-icon-arrow-repeat>
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-table
          ref="clustNodesTable"
          :items="clusterNodes"
          :fields="['hostname', 'clients']"
          small
          primary-key="id"
          responsive="true"
          striped
          hover
        >
          <template #cell(clients)="data">
            <div
              v-for="client in data.item.clients"
              :key="client"
              class="container"
            >
              <div class="row">
                <div class="col-sm">
                  {{ client._id }}
                </div>
              </div>
            </div>
          </template>
        </b-table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
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
