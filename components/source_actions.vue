<template>
  <div>
    <b-button
      v-b-tooltip.hover
      size="sm"
      class="float-right ml-1"
      variant="danger"
      title="Send config to source"
      @click="reconfigureSource(source.id)"
    >
      <b-icon-bootstrap-reboot scale="1.5" />
    </b-button>
    <b-button
      v-b-tooltip.hover
      :to="{
        name: 'client-edit_json-clientId',
        params: { clientId: source.id },
      }"
      size="sm"
      class="float-right ml-1"
      title="Edit raw JSON config"
    >
      <b-icon-file-code scale="1.5" />
    </b-button>
    <b-button
      v-if="source.configurable"
      v-b-tooltip.hover
      :to="{
        name: 'source-config_item_list-sourceId',
        params: { sourceId: source.id },
      }"
      variant="primary"
      size="sm"
      class="float-right ml-1"
      title="Edit source config"
    >
      <b-icon-gear scale="1.5" />
    </b-button>
  </div>
</template>

<script>
import Source from '~/models/Source'

export default {
  props: { source: Source },
  methods: {
    async reconfigureSource(sourceId) {
      const answer = await this.$bvModal.msgBoxConfirm(
        `Really reconfigure ${sourceId}?`,
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
          `/client/${sourceId}/reconfigure`
        )
        if (status === 200) {
          this.$toast.success('Requested source reconfiguration!')
        } else {
          this.$toast.error('Source reconfiguration failed!')
        }
      }
    },
  },
}
</script>

<style />
