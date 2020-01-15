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
              @click="addConfigItem()"
            >
              <b-spinner v-if="updating" class="ml-auto" small />
              Update configuration item
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
      `/source/${params.sourceId}/config_item/${encodeURIComponent(
        params.configItemId
      )}/input_form`
    )
    const { data: formData } = await $axios.get(
      `/source/${params.sourceId}/config_item/${encodeURIComponent(
        params.configItemId
      )}`
    )
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
    async addConfigItem() {
      const formData = {
        ...this.formData
      }
      console.log(formData)
      this.updating = true
      const { status } = await this.$axios.post(
        `/source/${this.sourceId}/config_item/${encodeURIComponent(
          this.$route.params.configItemId
        )}`,
        formData
      )
      if (status === 200) {
        this.$toast.success('Updated configuration item!')
      } else {
        this.$toast.error('Updating configuration item failed!')
      }
      this.updating = false
      this.$router.back()
    }
  }
}
</script>

<style scoped></style>
