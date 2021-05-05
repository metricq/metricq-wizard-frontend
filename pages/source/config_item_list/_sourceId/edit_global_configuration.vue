<template>
  <div>
    <b-row>
      <b-col>
        <h1>Source {{ sourceId }}: Global Configuration</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <FormGenerator v-model="formData" :schema="schema">
          <template #actions>
            <b-button
              :to="{
                name: 'source-config_item_list-sourceId',
                params: {
                  sourceId: sourceId,
                },
              }"
              class="mt-1"
              variant="danger"
            >
              Cancel
            </b-button>
            <b-button
              :disabled="updating"
              variant="primary"
              class="mt-1 float-right"
              @click="updateGlobalConfig()"
            >
              <b-spinner v-if="updating" class="ml-auto" small />
              Update global configuration
            </b-button>
          </template>
        </FormGenerator>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import FormGenerator from '~/components/forms/FormGenerator'
import Source from '~/models/Source'

export default {
  components: { FormGenerator },
  layout: 'nonfluid',
  async asyncData({ $axios, params, store }) {
    const { data: schema } = await $axios.get(
      `/source/${params.sourceId}/input_form`,
      {
        params: {
          session: store.state.session.sessionKey,
        },
      }
    )
    const { data: formData } = await $axios.get(`/source/${params.sourceId}`, {
      params: {
        session: store.state.session.sessionKey,
      },
    })
    return {
      sourceId: params.sourceId,
      schema,
      formData,
      updating: false,
    }
  },
  computed: {
    source() {
      return Source.query().whereId(this.sourceId).first() || new Source()
    },
  },
  methods: {
    async updateGlobalConfig() {
      const formData = {
        ...this.formData,
      }
      this.updating = true
      const { status } = await this.$axios.post(
        `/source/${this.sourceId}`,
        formData,
        {
          params: {
            session: this.$store.state.session.sessionKey,
          },
        }
      )
      if (status === 200) {
        this.$toast.success('Updated global config!')
        const answer = await this.$bvModal.msgBoxConfirm(
          `Save configuration for source ${this.id} and reconfigure source?`,
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
            `/source/${this.$route.params.sourceId}/save_reconfigure`,
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
          } else {
            this.$toast.error(
              'Saving configuration or source reconfiguration failed!'
            )
          }
        }
        this.$router.back()
      } else {
        this.$toast.error('Updating global config failed!')
      }
      this.updating = false
    },
  },
}
</script>

<style scoped></style>
