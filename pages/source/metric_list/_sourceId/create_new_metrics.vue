<template>
  <div>
    <b-row>
      <b-col>
        <h1>{{ sourceId }}</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        {{ source.selectedMetrics }}
      </b-col>
    </b-row>
    <b-row v-for="item in source.selectedMetrics" :key="item.id">
      <b-col>
        <b-card :title="item.id">
          <FormGenerator :schema="schema" v-model="formData[item.id]">
            <template v-slot:actions>
              <b-button
                :disabled="saving"
                variant="primary"
                @click="saveSingleMetric(item.id)"
              >
                <b-spinner v-if="saving" class="ml-auto" small />
                Save
              </b-button>
            </template>
          </FormGenerator>
        </b-card>
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
      `/source/${params.sourceId}/create_new_metric/input_form`
    )
    const source =
      Source.query()
        .whereId(params.sourceId)
        .first() || new Source()
    return {
      sourceId: params.sourceId,
      schema: data,
      formData: source.selectedMetrics.reduce(
        (o, key) => ({ ...o, [key.id]: {} }),
        {}
      ),
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
    saveSingleMetric(metricId) {
      const formData = {
        metricId,
        ...this.formData[metricId],
        source: this.source
      }
      console.log(formData)
      this.saving = true
      this.$axios
        .post(`/source/${this.sourceId}/create_new_metric`, formData)
        .finally(() => (this.saving = false))
    }
  }
}
</script>

<style scoped></style>
