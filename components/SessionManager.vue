<template>
  <b-col align-self="center">
    <p v-if="$fetchState.pending" class="float-right">
      <b-spinner class="ml-auto" small /> Loading session state....
    </p>
    <p v-else-if="$fetchState.error" class="float-right text-danger">
      Error while fetching session state
    </p>
    <b-row v-else align-v="center" class="border mr-1 mb-2 mt-2">
      <b-col cols="7">
        <p>
          Current source config status:
          <span v-if="canSave" class="text-success">not saved</span>
          <span v-else class="text-danger">can not be saved</span>
        </p>
        <p>
          Config loaded <em>{{ creationTime | momentAgo }}</em>
        </p>
      </b-col>
      <b-col>
        <div class="float-right">
          <b-button
            variant="primary"
            :disabled="!canSave"
            class="mb-1 mt-1"
            @click="save"
          >
            Save changes
          </b-button>
          <b-button variant="danger" class="mb-1" @click="reset">
            Discard changes
          </b-button>
        </div>
      </b-col>
    </b-row>
  </b-col>
</template>

<script>
import Metric from '~/models/Metric'

export default {
  name: 'SessionManager',
  props: {
    sourceId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      canSave: false,
      currentSessionCreationTime: new Date(),
      creationTime: new Date(),
    }
  },
  async fetch() {
    const { data } = await this.$axios.get(`/source/${this.sourceId}/session`, {
      params: {
        session: this.$store.state.session.sessionKey,
      },
    })
    this.currentSessionCreationTime = data.creation_time
    this.canSave = data.valid
    this.creationTime = data.plugin_creation_time
  },
  computed: {},
  methods: {
    async save() {
      const answer = await this.$bvModal.msgBoxConfirm(
        `Save configuration for source ${this.sourceId} and reconfigure source?`,
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
        const { status, data } = await this.$axios.post(
          `/source/${this.$route.params.sourceId}/save_reconfigure`,
          {},
          {
            params: {
              session: this.$store.state.session.sessionKey,
            },
          }
        )
        if (status === 200) {
          this.$toast.success(
            'Saved configuration and requested source reconfiguration!'
          )
          if (data.metrics.length !== 0) {
            const answer = await this.$bvModal.msgBoxConfirm(
              `${data.metrics.length} metrics created. Configure database storage for them?`,
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
              Metric.commit((state) => {
                state.fetching = true
              })
              const loadingToast = this.$toast.info(
                'Loading database configuration. Please wait!',
                { duration: null }
              )
              // TODO find right method for getting metric subset
              await Metric.api().post('/metrics', {
                requested_metrics: data.metrics,
              })
              Metric.commit((state) => {
                state.fetching = false
              })
              loadingToast.goAway()
              this.$toast.success('Loaded database configuration.')
              await this.$router.push({
                name: 'metric-configure',
                params: {
                  loadMetrics: false,
                },
              })
            }
          }
        } else {
          this.$toast.error(
            'Saving configuration or source reconfiguration failed!'
          )
        }
      }
    },
    async reset() {
      const answer = await this.$bvModal.msgBoxConfirm(
        `Are you sure you want to discard your unsaved configuration changes for ${this.sourceId}?`,
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
          `/source/${this.sourceId}/session/reset`,
          {},
          {
            params: {
              session: this.$store.state.session.sessionKey,
            },
          }
        )
        if (status === 200) {
          this.$toast.success('Success!')
          await this.$router.push({
            name: 'client-list',
          })
        } else {
          this.$toast.error('Discarding your modifications failed!')
        }
      }
    },
  },
}
</script>

<style scoped></style>
