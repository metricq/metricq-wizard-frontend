<template>
  <div>
    <b-row>
      <b-col>
        <h1>Client Overview</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-card no-body>
          <b-card-header align="right">
            <b-button variant="info" @click="updateTopology">
              <b-icon-arrow-repeat />
              Re-scan Cluster for active Clients
            </b-button>
          </b-card-header>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-table
          ref="metricListTable"
          :items="clients"
          :fields="['id', 'hostname', 'type', 'lastseen', 'actions']"
          small
          primary-key="id"
          responsive="true"
          sort-by="id"
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
      </b-col>
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
  async fetch() {
    Client.commit((state) => {
      state.fetching = true
    })
    Source.commit((state) => {
      state.fetching = true
    })

    // await Client.api().get('/clients')
    // await Client.api().get('/clients/active')
    // // await ActiveClient.api().get('/clients/active')
    // // await Source.api().get('/sources')
    // const sources = await Source.api().get('/sources', { save: false })

    // sources.response.data.forEach((source) => {
    //   if (Client.query().where('id', source.id).exists()) {
    //     const client = Client.find(source.id)
    //     Client.delete(source.id)

    //     source = {
    //       ...source,
    //       hostname: client.hostname,
    //       currentTime: client.currentTime,
    //       startingTime: client.startingTime,
    //       discoverTime: client.discoverTime,
    //       uptime: client.uptime,
    //       version: client.version,
    //       metricqVersion: client.metricqVersion,
    //     }
    //     Source.insert({ where: source.id, data: source })
    //   } else {
    //     Source.insert({ data: source })
    //   }
    // })

    const sources = await Source.api().get('/sources')
    console.log(`sources: ${JSON.stringify(sources.response.data)}`)
    console.log(`sources: ${JSON.stringify(sources.entities)}`)

    // const activeClients = await Client.api().get('/clients/active', {
    //   persistsBy: 'insert',
    // })
    // console.log(`activeClients: ${JSON.stringify(activeClients.response.data)}`)
    // console.log(`activeClients: ${JSON.stringify(activeClients.entities)}`)

    // const clients = await Client.api().get('/clients', { persistsBy: 'insert' })
    // console.log(`clients: ${JSON.stringify(clients.response.data)}`)
    // console.log(`clients: ${JSON.stringify(clients.entities.keys)}`)

    // await sources.save()

    Client.commit((state) => {
      state.fetching = false
    })
    Source.commit((state) => {
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
      await this.$axios.post(`/topology/discover`)
    },
  },
}
</script>

<style scoped />
