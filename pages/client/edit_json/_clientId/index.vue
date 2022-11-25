<template>
  <div>
    <b-row>
      <b-col>
        <h1>
          Client {{ clientId }}: JSON Editor
          <b-link class="float-right" @click="showJsonEditor = !showJsonEditor">
            <b-icon-file-code v-if="showJsonEditor"></b-icon-file-code>
            <b-icon-file-richtext v-else></b-icon-file-richtext>
          </b-link>
        </h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-button variant="danger" @click="$router.back()"> Cancel </b-button>
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
export default {
  components: {},
  layout: 'nonfluid',
  async asyncData({ $axios, params }) {
    const { data } = await $axios.get(`/source/${params.clientId}/raw_config`)

    const { _rev, ...config } = data.config

    return {
      clientId: params.clientId,
      jsonData: config,
      configRev: _rev,
      updating: false,
      showJsonEditor: JSON.stringify(data.config).length < 10000,
    }
  },
  methods: {
    async saveConfig() {
      this.updating = true
      const { status } = await this.$axios.post(
        `/source/${this.clientId}/raw_config`,
        { _rev: this.configRev, ...this.jsonData }
      )
      if (status === 200) {
        this.$toast.success('Saved config!')
        const answer = await this.$bvModal.msgBoxConfirm(
          `Reconfigure client ${this.clientId}?`,
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
            `/client/${this.clientId}/reconfigure`
          )
          if (status === 200) {
            this.$toast.success('Requested client reconfiguration!')
          } else {
            this.$toast.error('Client reconfiguration failed!')
          }
        }
        this.$router.back()
      } else {
        this.$toast.error('Saving config failed!')
      }
      this.updating = false
    },
  },
}
</script>

<style scoped></style>
