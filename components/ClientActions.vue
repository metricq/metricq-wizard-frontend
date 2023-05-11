<template>
  <div class="text-right">
    <b-button-group v-if="client" size="sm" class="shadow-sm">
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
        <b-icon-wrench scale="1.5" />
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
        <b-icon-file-text scale="1.5" />
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
        <b-icon-search scale="1.5" />
      </b-button>
      <b-button
        v-b-tooltip.hover.noninteractive
        variant="danger"
        title="Send config to client"
        @click="reconfigureClient(client)"
      >
        <b-icon-bootstrap-reboot scale="1.5" />
      </b-button>
      <b-button
        v-if="showDelete"
        v-b-tooltip.hover.noninteractive
        variant="warning"
        title="Delete the client"
        @click="deleteClient(client)"
      >
        <b-icon-trash scale="1.5" />
      </b-button>
    </b-button-group>
    <b-icon-exclamation-diamond v-else variant="danger" />
  </div>
</template>

<script>
import Client from '~/models/Client'

export default {
  props: {
    client: Client,
    showDetails: { type: Boolean, default: true },
    showDelete: { type: Boolean, default: false },
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
