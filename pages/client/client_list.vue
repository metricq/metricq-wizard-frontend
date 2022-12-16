<template>
  <div>
    <b-row>
      <b-col>
        <h1>Client Overview</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-overlay :show="showReScanOverlay" rounded="sm">
          <b-card no-body>
            <b-card-header>
              <b-row>
                <b-col>
                  <b-input-group size="sm">
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
            >
              <template #head(lastseen)> Last seen </template>
              <template #cell(lastseen)="data">
                <span v-if="data.item.discoverTime">
                  {{ data.item.discoverTime | momentago }} </span
                ><span v-else>never seen</span>
              </template>
              <template #head(actions)="data">
                <span class="float-right">{{ data.label }}</span>
              </template>
              <template #cell(actions)="data">
                <source-actions :source="data.item" />
              </template>
            </b-table>
          </b-card>
        </b-overlay>
      </b-col>
    </b-row>
    <b-row>
      <b-col> </b-col>
    </b-row>
  </div>
</template>

<script>
import SourceActions from '~/components/source_actions.vue'
import Source from '~/models/Source'
import Client from '~/models/Client'

export default {
  components: { SourceActions },
  layout: 'nonfluid',
  data() {
    return {
      filter: null,
      showReScanOverlay: false,
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

      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
      }
      await sleep(10000)

      this.$nuxt.refresh()
      this.showReScanOverlay = false
    },
  },
}
</script>

<style scoped />
