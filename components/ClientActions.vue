<template>
  <div align="right">
    <b-button-group size="sm" class="shadow-sm">
      <b-button
        v-if="client.configurable"
        v-b-tooltip.hover
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
        v-b-tooltip.hover
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
        v-b-tooltip.hover
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
        v-b-tooltip.hover
        variant="danger"
        title="Send config to client"
        @click="reconfigureClient(client.id)"
      >
        <b-icon-bootstrap-reboot scale="1.5" />
      </b-button>
    </b-button-group>
  </div>
</template>

<script>
import Client from '~/models/Client'

export default {
  props: { client: Client, showDetails: { type: Boolean, default: true } },
  methods: {
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
          this.$toast.success('Requested Client reconfiguration!')
        } else {
          this.$toast.error('Client reconfiguration failed!')
        }
      }
    },
  },
}
</script>

<style />
