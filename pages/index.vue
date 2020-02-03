<template>
  <b-container fluid>
    <div>
      <b-row>
        <b-col align="center" cols="6" offset="3">
          <h1>
            metricq-&#x1F9D9;-frontend
          </h1>
          <p class="lead">
            A configuration web app for MetricQ
          </p>
        </b-col>
      </b-row>
    </div>
  </b-container>
</template>

<script>
import Metric from '~/models/Metric'
import Database from '~/models/Database'

export default {
  components: {},
  asyncData({ query }) {},
  computed: {
    selected() {
      return Metric.query()
        .with('database')
        .where('selected', true)
        .get()
    }
  },
  methods: {}
}
</script>

<style></style>
