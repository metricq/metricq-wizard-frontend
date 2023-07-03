<template>
  <div class="text-right">
    <b-button-group v-if="client" size="sm" class="shadow-sm">
      <b-button
        v-if="isSource"
        v-b-tooltip.hover.noninteractive
        variant="dark"
        title="Load all metrics into Metric Workshop"
        @click="loadClientMetrics(client.id)"
      >
        <b-icon-bookmarks scale="1.3" />
      </b-button>
      <b-button
        v-if="client.configurable"
        v-b-tooltip.hover.noninteractive
        :to="{
          name: 'source-config_item_list-sourceId',
          params: { sourceId: client.id },
        }"
        variant="primary"
        title="Edit client config"
      >
        <b-icon-wrench scale="1.3" />
      </b-button>
      <b-button
        v-if="client.hasConfiguration"
        v-b-tooltip.hover.noninteractive
        :to="{
          name: 'client-edit_json-clientId',
          params: { clientId: client.id },
        }"
        title="Edit raw JSON config"
      >
        <b-icon-file-text scale="1.3" />
      </b-button>
      <b-button
        v-if="showDetails"
        v-b-tooltip.hover.noninteractive
        :to="{
          name: 'client-clientId',
          params: { clientId: client.id },
        }"
        title="Client Details"
        variant="info"
      >
        <b-icon-search scale="1.3" />
      </b-button>
      <b-button
        v-b-tooltip.hover.noninteractive
        variant="danger"
        title="Send config to client"
        @click="reconfigureClient(client)"
      >
        <b-icon-bootstrap-reboot scale="1.3" />
      </b-button>
      <b-button
        v-if="showDelete"
        v-b-tooltip.hover.noninteractive
        variant="warning"
        title="Delete the client"
        @click="deleteClient(client)"
      >
        <b-icon-trash scale="1.3" />
      </b-button>
    </b-button-group>
    <b-icon-exclamation-diamond v-else variant="danger" />
  </div>
</template>

<script>
import Client from '~/models/Client'
import Metric from '~/models/Metric'

export default {
  props: {
    client: Client,
    showDetails: { type: Boolean, default: true },
    showDelete: { type: Boolean, default: false },
  },
  computed: {
    isSource() {
      return (
        this.client.id.startsWith('source-') ||
        this.client.id.startsWith('transformer-')
      )
    },
  },
  methods: {
    async reconfigureClient(client) {
      const reconfigureConfirmed = await this.$bvModal.msgBoxConfirm(
        `Really reconfigure ${client.id}?`,
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

      if (reconfigureConfirmed) {
        const { response } = await client.reconfigure()

        if (response.status === 200) {
          this.$toast.success('Requested Client reconfiguration!')
        } else {
          this.$toast.error('Client reconfiguration failed!')
        }
      }
    },
    async deleteClient(client) {
      const deleteConfirmed = await this.$bvModal.msgBoxConfirm(
        `Really delete ${client.id}?`,
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

      if (deleteConfirmed) {
        const { response } = await client.delete()

        if (response.status === 200) {
          this.$toast.success('Successfully deleted the client configuration!')
          this.$router.push({
            name: 'client-list',
          })
        } else {
          this.$toast.error('Failed to delete the client!')
        }
      }
    },
    async loadClientMetrics(client) {
      Metric.commit((state) => {
        state.fetching = true
      })

      let dataTransformer = Metric.convertMetricListResponse

      if (client.startsWith('transformer-') && client.endsWith('-combinator')) {
        dataTransformer = (response) => {
          return Metric.convertMetricListResponse(response).map(
            (currentValue) => {
              return {
                ...currentValue,
                sourceType: 'transformer',
              }
            }
          )
        }
      }

      await Metric.api().post(
        '/metrics',
        {
          source: client,
        },
        {
          dataTransformer,
        }
      )
      Metric.commit((state) => {
        state.fetching = false
      })
    },
  },
}
</script>

<style scoped>
/* Fix positions of tooltips. Known issue, see:
    https://github.com/bootstrap-vue/bootstrap-vue/issues/1732 */
.tooltip {
  top: 0;
}
</style>
