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
              :disabled="adding"
              variant="primary"
              @click="addConfigItem()"
            >
              <b-spinner v-if="adding" class="ml-auto" small />
              Add configuration item
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
    const { data } = await $axios.get(
      `/source/${params.sourceId}/config_items/input_form`
    )
    return {
      sourceId: params.sourceId,
      schema: data,
      formData: {},
      adding: false
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
      this.adding = true
      const { status } = await this.$axios.post(
        `/source/${this.sourceId}/config_items`,
        formData
      )
      if (status === 200) {
        this.$toast.success('Added configuration item!')
      } else {
        this.$toast.error('Adding configuration item failed!')
      }
      this.adding = false
      this.$router.back()
    }
  }
}
</script>

<style scoped></style>
