<template>
  <div class="p-2">
    <b-row>
      <b-col>
        <h1>{{ id }}</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-card>
          <FormGenerator :schema="schema" v-model="formData">
            <template v-slot:actions>
              <b-button :disabled="searching" variant="primary" @click="search">
                <b-spinner v-if="searching" class="ml-auto" small />
                Search
              </b-button>
            </template>
          </FormGenerator>
        </b-card>
      </b-col>
    </b-row>
    <b-table
      :fields="fields"
      :items="possibleMetrics"
      selectable
      small
      @row-selected="onRowSelected"
    />
    <b-row>
      <b-col>
        {{ source.selectedMetrics }}
      </b-col>
      <b-col cols="2" align="right">
        <b-button
          :to="{
            name: 'source-metric_list-sourceId-create_new_metrics',
            params: {
              sourceId: id
            }
          }"
          :disabled="source.selectedMetrics.length === 0"
        >
          Configure new metrics
        </b-button>
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
      `/source/${params.sourceId}/get_available_metrics/input_form`
    )
    const source =
      Source.query()
        .whereId(params.sourceId)
        .first() || new Source()
    return {
      id: params.sourceId,
      formData: Object.assign({}, source.searchParams),
      schema: data,
      searching: false,
      fields: ['id', 'current_value'],
      possibleMetrics: []
    }
  },
  computed: {
    source() {
      return (
        Source.query()
          .whereId(this.id)
          .first() || new Source()
      )
    }
  },
  methods: {
    search() {
      this.searching = true
      Source.insertOrUpdate({
        data: {
          id: this.id,
          searchParams: this.formData
        }
      })
      this.$axios
        .post(`/source/${this.id}/get_available_metrics`, this.formData)
        .then((response) => {
          this.possibleMetrics = response.data
        })
        .finally(() => (this.searching = false))
    },
    onRowSelected(selectedRows) {
      Source.insertOrUpdate({
        data: {
          id: this.id,
          selectedMetrics: selectedRows
        }
      })
    }
  }
}
</script>

<style scoped />
