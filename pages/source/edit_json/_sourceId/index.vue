<template>
  <div>
    <b-row>
      <b-col>
        <h1>
          Source {{ sourceId }}: JSON Editor
          <b-link class="float-right" @click="showJsonEditor = !showJsonEditor">
            <b-icon-document-code v-if="showJsonEditor"></b-icon-document-code>
            <b-icon-document-richtext v-else></b-icon-document-richtext>
          </b-link>
        </h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-button variant="danger" @click="$router.back()">
          Cancel
        </b-button>
      </b-col>
      <b-col>
        <b-button class="float-right" variant="primary" @click="saveConfig">
          <b-spinner v-if="updating" class="ml-auto" small />
          Save config
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <JsonEditor
          v-if="showJsonEditor"
          v-model="jsonData"
          :obj-data="jsonData"
          is-edit="true"
        ></JsonEditor>
        <b-form-textarea
          v-else
          :value="jsonData"
          max-rows="30"
          @input="jsonData = JSON.parse($event)"
        ></b-form-textarea>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Source from '~/models/Source'
export default {
  layout: 'nonfluid',
  components: {},
  async asyncData({ $axios, params }) {
    const { data } = await $axios.get(`/source/${params.sourceId}/raw_config`)

    return {
      sourceId: params.sourceId,
      jsonData: data.config,
      updating: false,
      showJsonEditor: true
    }
  },
  computed: {
    source() {
      return (
        Source.query()
          .whereId(this.sourceId)
          .first() || new Source()
      )
    }
  },
  methods: {
    async saveConfig() {
      this.updating = true
      const { status } = await this.$axios.post(
        `/source/${this.sourceId}/raw_config`,
        this.jsonData
      )
      if (status === 200) {
        this.$toast.success('Saved config!')
        const answer = await this.$bvModal.msgBoxConfirm(
          `Reconfigure source ${this.sourceId}?`,
          {
            title: 'Please Confirm',
            buttonSize: 'sm',
            okVariant: 'danger',
            okTitle: 'YES',
            cancelTitle: 'NO',
            footerClass: 'p-2',
            hideHeaderClose: false,
            centered: true
          }
        )
        if (answer) {
          const { status } = await this.$axios.post(
            `/source/${this.sourceId}/reconfigure`
          )
          if (status === 200) {
            this.$toast.success('Requested source reconfiguration!')
          } else {
            this.$toast.error('Source reconfiguration failed!')
          }
        }
        this.$router.back()
      } else {
        this.$toast.error('Saving config failed!')
      }
      this.updating = false
    }
  }
}
</script>

<style scoped></style>
