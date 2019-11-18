<template>
  <b-container fluid>
    <div>
      <MetricTable />
      <b-row>
        <b-col>{{ selected }}</b-col>
        <b-col cols="2" align="right">
          <b-button
            :to="{
              name: 'metric-database_configuration'
            }"
            :disabled="selected.length == 0"
          >
            Configure database
          </b-button>
        </b-col>
      </b-row>
    </div>
  </b-container>
</template>

<script>
import MetricTable from '~/components/MetricTable'
import Metric from '~/models/Metric'

export default {
  components: {
    MetricTable
  },
  computed: {
    selected() {
      return Metric.query()
        .with('database')
        .where('selected', true)
        .get()
    }
  },
  asyncData({ query }) {},
  methods: {}
}
</script>

<style></style>
