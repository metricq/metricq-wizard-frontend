<template>
  <div>
    <b-modal
      id="backupRestoreModal"
      size="xl"
      scrollable
      centered
      ok-title="Import"
      :title="backupModalTitle"
      @ok="onBackupRestore"
    >
      <JsonTree :data="backupJsonData" />
    </b-modal>
    <b-row>
      <b-col>
        <h1>
          {{ clientId }}
          <span class="lead">Edit JSON configuration</span>
        </h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-card no-body>
          <b-tabs card>
            <b-tab title="Graphical Editor" :active="showJsonEditor" lazy>
              <b-container>
                <JsonEditor
                  v-model="jsonData"
                  :obj-data="jsonData"
                  is-edit="true"
                />
              </b-container>
            </b-tab>
            <b-tab title="Textual Editor" :active="!showJsonEditor" lazy>
              <b-form-textarea
                ref="rawInput"
                :value="jsonData"
                max-rows="25"
                class="rawInput"
                autocorrect="off"
                spellcheck="false"
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                @input="onRawEdit($event)"
              />
            </b-tab>
            <b-tab title="Preview" lazy>
              <json-tree :data="jsonData" />
            </b-tab>
            <b-tab title="Backups">
              <b-list-group>
                <b-list-group-item
                  v-for="backup in backups"
                  :key="backup"
                  button
                  @click="onBackupClick(backup)"
                >
                  {{ backup }}
                </b-list-group-item>
              </b-list-group>
            </b-tab>
          </b-tabs>
        </b-card>
        <b-card-footer>
          <b-row>
            <b-col>
              <b-button variant="danger" @click="$router.back()">
                Cancel
              </b-button>
            </b-col>
            <b-col>
              <b-button
                ref="saveButton"
                class="float-right"
                variant="primary"
                @click="saveConfig"
              >
                <b-spinner v-if="updating" class="ml-auto" small />
                Save config
              </b-button>
            </b-col>
          </b-row>
        </b-card-footer>
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
    const backups = (await $axios.get(`/client/${params.clientId}/backups`))
      .data

    return {
      clientId: params.clientId,
      jsonData: data.config,
      backupJsonData: undefined,
      backupId: undefined,
      backups,
      updating: false,
      showJsonEditor: JSON.stringify(data.config).length < 10000,
    }
  },
  computed: {
    backupModalTitle() {
      return `Do you want to import from ${this.backupId}`
    },
  },
  methods: {
    async saveConfig() {
      this.updating = true
      const { status } = await this.$axios.post(
        `/source/${this.clientId}/raw_config`,
        this.jsonData
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
    onRawEdit(input) {
      try {
        this.jsonData = JSON.parse(input)
        this.$refs.rawInput.state = true
        this.$refs.saveButton.disabled = false
      } catch (error) {
        this.$refs.rawInput.state = false
        this.$refs.saveButton.disabled = true
      }
    },
    async onBackupClick(backupId) {
      const { data } = await this.$axios.get(
        `/client/${this.clientId}/backup/${backupId}`
      )
      this.backupId = backupId
      this.backupJsonData = data
      this.$bvModal.show('backupRestoreModal')
    },
    onBackupRestore() {
      this.jsonData = { _rev: this.jsonData._rev, ...this.backupJsonData }
    },
  },
}
</script>

<style scoped>
.json-tree-root {
  background-color: white;
}
</style>
