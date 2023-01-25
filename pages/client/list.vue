<template>
  <div>
    <b-row>
      <b-col>
        <h1>
          Client Overview 📟
          <span class="lead">Configure clients running in the cluster</span>
        </h1>
      </b-col>
    </b-row>

    <b-row v-if="chartOptions !== null && !showReScanOverlay" class="mb-4">
      <b-col>
        <b-card no-body header="Dependency Graph">
          <highcharts :options="chartOptions" />
        </b-card>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <b-overlay :show="showReScanOverlay" rounded="sm">
          <b-card no-body class="mb-3">
            <b-card-header>
              <b-row>
                <b-col>
                  <b-input-group size="sm" prepend="Filter">
                    <b-form-input
                      id="filter-input"
                      v-model="filter"
                      type="search"
                      :autofocus="true"
                      placeholder="Type to Search"
                    ></b-form-input>

                    <b-input-group-append>
                      <b-button :disabled="!filter" @click="filter = ''"
                        >Clear</b-button
                      >
                    </b-input-group-append>
                  </b-input-group>
                </b-col>
                <b-col align="right">
                  <b-button variant="info" @click="updateTopology">
                    <b-icon-arrow-repeat />
                    Re-scan Cluster for active Clients
                  </b-button>
                </b-col>
              </b-row>
            </b-card-header>

            <b-table
              ref="metricListTable"
              :items="clients"
              :fields="[
                { key: 'id', sortable: true },
                { key: 'hostname', sortable: true },
                { key: 'version', sortable: true },
                { key: 'metricqVersion', sortable: true },
                { key: 'startingTime', sortable: true },
                { key: 'lastseen', sortable: true },
                { key: 'actions' },
              ]"
              small
              :filter="filter"
              :filter-included-fields="['id', 'hostname']"
              primary-key="id"
              responsive="true"
              sort-by="id"
              sort-icon-left
              striped
              hover
              class="mb-0"
              show-empty
            >
              <template #head(lastseen)> Last seen </template>
              <template #cell(lastseen)="data">
                <span v-if="data.item.discoverTime">
                  {{ data.item.discoverTime | momentAgo }} </span
                ><span v-else>never seen</span>
              </template>
              <template #head(startingTime)> Started </template>
              <template #cell(startingTime)="data">
                <span v-if="data.item.startingTime">
                  {{ data.item.startingTime | momentAgo }}
                </span>
              </template>

              <template #head(actions)="data">
                <span class="float-right">{{ data.label }}</span>
              </template>
              <template #cell(actions)="data">
                <client-actions :client="data.item" />
              </template>
              <template #emptyfiltered>
                <b-jumbotron
                  header="No client matches the input"
                  bg-variant="grey"
                >
                  <b-button
                    v-b-modal.new-client-modal
                    variant="primary"
                    href="#"
                    size="lg"
                  >
                    <b-icon-plus />
                  </b-button>

                  Create an empty configuration for the token
                  <span class="p-1 text-monospace">"{{ filter }}"</span>
                  instead?
                </b-jumbotron>
              </template>
            </b-table>
          </b-card>
        </b-overlay>
      </b-col>
    </b-row>
    <b-modal
      id="new-client-modal"
      title="Create Client"
      :lazy="true"
      @ok="createClient"
    >
      <p class="my-4">
        Create empty config for <span class="lead">{{ filter }}</span>
        ?
      </p>
    </b-modal>
  </div>
</template>

<script>
import ClientActions from '~/components/ClientActions.vue'
import Client from '~/models/Client'

const DISCOVER_WAIT_TIME = 10

export default {
  components: { ClientActions },
  data() {
    return {
      filter: null,
      showReScanOverlay: false,
    }
  },
  async fetch() {
    await Client.fetchAll()
  },
  asyncComputed: {
    async chartOptions() {
      return {
        title: null,
        series: [
          {
            keys: ['from', 'to', 'weight'],
            data: (await this.$axios.get(`/clients/dependencies`)).data,
            type: 'dependencywheel',
            name: 'Amount of metrics consumed',
          },
        ],
      }
    },
  },
  computed: {
    clients() {
      return Client.query().all()
    },
  },
  methods: {
    async editRawConfig(clientId) {
      const answer = await this.$bvModal.msgBoxConfirm(
        this.guiForConfigExists(clientId)
          ? `The wizard has a better way to edit the config of client ${clientId}. Do you REALLY want to edit the raw JSON config?`
          : `Do you really want to edit the raw JSON config of client ${clientId}?`,
        {
          title: 'Are you sure?',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: this.guiForConfigExists(clientId)
            ? 'Yes, I really want it'
            : 'YES',
          cancelTitle: 'NO',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true,
        }
      )
      if (answer) {
        await this.$router.push({
          name: 'client-edit_json-clientId',
          params: { clientId },
        })
      }
    },
    async reconfigureClient(clientId) {
      const answer = await this.$bvModal.msgBoxConfirm(
        `Really reconfigure ${clientId}?`,
        {
          title: 'Please Confirm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'YES',
          cancelTitle: 'NO',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true,
        }
      )
      if (answer) {
        const { status } = await this.$axios.post(
          `/client/${clientId}/reconfigure`
        )
        if (status === 200) {
          this.$toast.success('Requested client reconfiguration!')
        } else {
          this.$toast.error('Client reconfiguration failed!')
        }
      }
    },
    guiForConfigExists(clientId) {
      return (
        clientId.startsWith('db-') ||
        clientId.startsWith('source-') ||
        (clientId.startsWith('transformer') && clientId.endsWith('-combinator'))
      )
    },
    async updateTopology() {
      this.showReScanOverlay = true
      await this.$axios.post(`/topology/discover`)

      await this.$sleep(DISCOVER_WAIT_TIME)

      this.$nuxt.refresh()
      this.showReScanOverlay = false
    },
    async createClient() {
      await this.$axios.put(`/client/${this.filter}`)
      this.$nuxt.refresh()
    },
  },
}
</script>

<style scoped />
