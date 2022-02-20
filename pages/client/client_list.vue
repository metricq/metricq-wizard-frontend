<template>
  <div>
    <b-row>
      <b-col>
        <h1>Client Overview</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-table
          ref="metricListTable"
          :items="clients"
          :fields="['id', 'actions']"
          small
          primary-key="id"
          responsive="true"
          striped
          hover
        >
          <template #head(actions)="data">
            <span class="float-right">{{ data.label }}</span>
          </template>
          <template #cell(actions)="data">
            <b-button
              size="sm float-right ml-1"
              variant="danger"
              @click="reconfigureClient(data.item.id)"
            >
              <b-icon-bootstrap-reboot scale="1.5" />
            </b-button>
            <b-button
              v-b-tooltip.hover
              size="sm"
              class="float-right"
              title="Edit raw JSON config"
              @click="editRawConfig(data.item.id)"
            >
              <b-icon-file-code scale="1.5" />
            </b-button>
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
    const { data } = await $axios.get(`/clients`)
    return {
      clients: data,
    }
  },
  fetch() {},
  computed: {},
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
  },
}
</script>

<style scoped />
