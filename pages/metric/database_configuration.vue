<template>
  <b-container fluid>
    <MetricDatabaseConfiguration
      v-bind:globalDatabaseSettings="databaseSettings"
      @metric-database-apply-to-all="onMetricDatabaseApplyToAll"
      v-bind:showApplyAll="true"
      hide-save="true"
      class="mb-2"
    />
    <div v-for="item in selected" v-bind:key="item.id">
      <MetricDatabaseConfiguration
        ref="dbConfigs"
        v-bind:metricId="item.id"
        v-bind:globalDatabaseSettings="databaseSettings"
        @metric-database-apply-to-all="onMetricDatabaseApplyToAll"
        class="mb-2"
      />
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
        <b-col />
        <b-col cols="2" align="right">
          <b-button
            variant="primary"
            @click="onSaveAllClicked"
            :disabled="saving"
          >
            <b-spinner class="ml-auto" small v-if="saving" />
            Save all
          </b-button>
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
    saving() {
      return (
        Metric.query()
          .where('saving', true)
          .count() !== 0
      )
    }
  },
  fetch() {
    Database.commit((state) => {
      state.fetching = true
    })
    Database.api()
      .get('/databases')
      .then(() => {
        Database.commit((state) => {
          state.fetching = false
        })
      })
  },
  methods: {
    onMetricDatabaseApplyToAll(databaseSettings) {
      this.databaseSettings = databaseSettings
    },
    onSaveAllClicked() {
      this.$refs.dbConfigs.forEach(function(child) {
        child.save()
      })
    }
  }
}
</script>

<style scoped />
