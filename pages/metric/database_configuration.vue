<template>
  <div>
    <b-row>
      <b-col>
        <h1>Metrics Database Configuration</h1>
      </b-col>
    </b-row>
    <MetricDatabaseConfiguration
      :global-database-settings="databaseSettings"
      :show-apply-all="true"
      :hide-save="true"
      class="mb-2"
      @metric-database-apply-to-all="onMetricDatabaseApplyToAll"
      v-if="selected.length > 1"
    />
    <div v-for="item in selected" :key="item.id">
      <MetricDatabaseConfiguration
        ref="dbConfigs"
        :metric-id="item.id"
        :global-database-settings="databaseSettings"
        class="mb-2"
        @metric-database-apply-to-all="onMetricDatabaseApplyToAll"
        @metric-database-saved="onMetricDatabaseSaved"
      />
    </div>
    <b-row>
      <b-col cols="2">
        <b-button
          :to="{
            name: 'metric-metric_list'
          }"
          variant="danger"
        >
          Cancel
        </b-button>
      </b-col>
      <b-col />
      <b-col cols="2" align="right">
        <b-button
          variant="primary"
          :disabled="saving"
          @click="onSaveAllClicked"
        >
          <b-spinner v-if="saving" class="ml-auto" small />
          Save database settings for all metrics
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import MetricDatabaseConfiguration from '~/components/MetricDatabaseConfiguration'
import Metric from '~/models/Metric'
import Database from '~/models/Database'

export default {
  components: {
    MetricDatabaseConfiguration
  },
  async fetch() {
    // TODO Fetch database-metric relation only for selected metrics
    const selectedMetrics = Metric.query()
      .where('selected', true)
      .all()
      .map((k, v) => v.id)
    Database.commit((state) => {
      state.fetching = true
    })
    await Database.api()
      .post('/databases/historic_metrics', {
        selectedMetrics
      })
      .finally(() => {
        Database.commit((state) => {
          state.fetching = false
        })
      })
  },
  data() {
    return {
      databaseSettings: {},
      savedDatabases: new Set()
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
  watch: {
    saving(newValue, oldValue) {
      if (newValue === false && oldValue === true) {
        const databasesString = Array.from(this.savedDatabases).join(',')
        this.$bvModal
          .msgBoxConfirm(
            `Reconfigure following databases?\n${databasesString}`,
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
          .then((value) => {
            if (value) {
              this.savedDatabases.forEach((databaseId) => {
                console.log(`Restarting ${databaseId}`)
                Database.api().reconfigureById(databaseId)
              })
              this.savedDatabases = new Set()
            } else {
              console.log('Do not restart database')
            }
          })
      }
    }
  },
  methods: {
    onMetricDatabaseApplyToAll(databaseSettings) {
      this.databaseSettings = databaseSettings
    },
    onSaveAllClicked() {
      this.$refs.dbConfigs.forEach(function(child) {
        child.save()
      })
    },
    onMetricDatabaseSaved(databaseId) {
      this.savedDatabases.add(databaseId)
    }
  }
}
</script>

<style scoped />
