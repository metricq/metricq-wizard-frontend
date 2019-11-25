<template>
  <b-container fluid>
    <div v-for="item in selected">
      <MetricDatabaseConfiguration
        v-bind:metricId="item.id"
        v-bind:globalDatabaseSettings="databaseSettings"
        @metric-database-apply-to-all="onMetricDatabaseApplyToAll"
        class="mb-2"
      >
      </MetricDatabaseConfiguration>
    </div>
    <div>
      <b-row>
        <b-col cols="2">
          <b-button
            :to="{
              name: 'metric-metric_list'
            }"
          >
            Back to overview
          </b-button>
        </b-col>
        <b-col>
          {{ databases }}
        </b-col>
      </b-row>
    </div>
  </b-container>
</template>

<script>
import MetricDatabaseConfiguration from '~/components/MetricDatabaseConfiguration'
import Metric from '~/models/Metric'
import Database from '~/models/Database'

export default {
  components: {
    MetricDatabaseConfiguration
  },
  data() {
    return {
      databaseSettings: {}
    }
  },
  computed: {
    selected() {
      return Metric.query()
        .with('database')
        .where('selected', true)
        .all()
    },
    databases() {
      return []
    }
  },
  fetch() {
    Database.api().get('/databases')
  },
  methods: {
    onMetricDatabaseApplyToAll(databaseSettings) {
      this.databaseSettings = databaseSettings
    }
  }
}
</script>

<style scoped></style>
