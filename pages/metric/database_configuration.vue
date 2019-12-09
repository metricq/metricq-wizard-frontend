<template>
  <b-container fluid>
    <MetricDatabaseConfiguration
      v-bind:globalDatabaseSettings="databaseSettings"
      @metric-database-apply-to-all="onMetricDatabaseApplyToAll"
      v-bind:showApplyAll="true"
      v-bind:hide-save="true"
      class="mb-2"
    />
    <div v-for="item in selected" v-bind:key="item.id">
      <MetricDatabaseConfiguration
        ref="dbConfigs"
        v-bind:metricId="item.id"
        v-bind:globalDatabaseSettings="databaseSettings"
        @metric-database-apply-to-all="onMetricDatabaseApplyToAll"
        @metric-database-saved="onMetricDatabaseSaved"
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
  fetch() {
    // TODO Fetch database-metric relation only for selected metrics
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
  }
}
</script>

<style scoped />
