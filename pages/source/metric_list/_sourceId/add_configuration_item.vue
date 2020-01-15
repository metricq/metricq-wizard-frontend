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
              :disabled="saving"
              variant="primary"
              @click="saveConfigItem()"
            >
              <b-spinner v-if="saving" class="ml-auto" small />
              Save
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
      saving: false
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
    saveConfigItem() {
      const formData = {
        ...this.formData
      }
      console.log(formData)
      this.saving = true
      this.$axios
        .post(`/source/${this.sourceId}/config_items`, formData)
        .finally(() => (this.saving = false))
    }
  }
}
</script>

<style scoped></style>
