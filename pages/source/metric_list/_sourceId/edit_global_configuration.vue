<template>
  <div class="p-2">
    <b-row>
      <b-col>
        <h1>{{ sourceId }}</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <FormGenerator :schema="schema" v-model="formData">
          <template v-slot:actions>
            <b-button
              :disabled="updating"
              variant="primary"
              @click="updateGlobalConfig()"
              class="mt-1"
            >
              <b-spinner v-if="updating" small />
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
  async asyncData({ $axios, params }) {
    const { data: schema } = await $axios.get(
      `/source/${params.sourceId}/input_form`
    )
    const { data: formData } = await $axios.get(`/source/${params.sourceId}`)
    return {
      sourceId: params.sourceId,
      schema,
      formData,
      updating: false
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
    async updateGlobalConfig() {
      const formData = {
        ...this.formData
      }
      console.log(formData)
      this.updating = true
      const { status } = await this.$axios.post(
        `/source/${this.sourceId}`,
        formData
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
            centered: true
          }
        )
        if (answer) {
          const { status } = await this.$axios.post(
            `/source/${this.$route.params.sourceId}/save_reconfigure`
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
        } else {
          console.log('Do not restart source')
        }
        this.$router.back()
      } else {
        this.$toast.error('Updating global config failed!')
      }
      this.updating = false
    }
  }
}
</script>

<style scoped></style>
