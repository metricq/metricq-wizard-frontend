<template>
  <b-card :header="metric.id" :sub-title="metric.description">
    <b-form ref="databaseForm" inline class="mb-2 align-items-start d-flex">
      <b-form-group
        class="flex-fill mr-sm-2"
        label="Database"
        label-align="center"
        label-size="sm"
      >
        <b-form-select
          id="inline-form-custom-select-pref"
          v-model="databaseSettings.databaseId"
          :options="databases"
          :value="null"
          :disabled="metric.historic"
          required
          class="w-100"
        >
          <template v-slot:first>
            <b-form-select-option :value="null" :disabled="!showApplyAll"
              >Choose...</b-form-select-option
            >
          </template>
        </b-form-select>
      </b-form-group>
      <b-form-group
        class="flex-fill mr-sm-2"
        description="duration string, default unit is seconds"
        label="Minimal aggregation interval"
        label-align="center"
        label-size="sm"
      >
        <b-form-input
          id="input-1"
          ref="intervalMinFormField"
          v-model="databaseSettings.intervalMin"
          :state="intervalMinState"
          :disabled="metric.historic"
          required
          placeholder="duration, e.g. 10s"
          class="w-100"
        />
      </b-form-group>
      <b-form-group
        class="flex-fill mr-sm-2"
        description="duration string, default unit is seconds"
        label="Maximal aggregation interval"
        label-align="center"
        label-size="sm"
      >
        <b-form-input
          id="input-2"
          ref="intervalMaxFormField"
          v-model="databaseSettings.intervalMax"
          :state="intervalMaxState"
          :disabled="metric.historic"
          required
          placeholder="duration, e.g. 365d"
          class="w-100"
        />
      </b-form-group>
      <b-form-group
        class="flex-fill mr-sm-2"
        description=""
        label="Aggregation interval factor"
        label-align="center"
        label-size="sm"
      >
        <b-form-input
          id="input-3"
          v-model="databaseSettings.intervalFactor"
          :state="intervalFactorState"
          :disabled="metric.historic"
          type="number"
          required
          placeholder="10"
          class="w-100"
        />
      </b-form-group>
      <b-button
        :disabled="metric.historic"
        type="reset"
        variant="danger"
        class="flex-fill align-self-center mr-2"
      >
        Reset to defaults
      </b-button>
      <b-button
        v-if="showApplyAll"
        variant="primary"
        class="flex-fill align-self-center mr-2"
        @click="onApplyToAll"
      >
        Apply settings to all metrics
      </b-button>
      <b-button
        v-if="!hideSave"
        :disabled="metric.historic || metric.saving"
        variant="primary"
        class="flex-fill align-self-center"
        @click="save"
      >
        <b-spinner v-if="metric.saving" class="ml-auto" small />
        Save database settings for metric
      </b-button>
    </b-form>
  </b-card>
</template>

<script>
import timestring from 'timestring'
import Metric from '~/models/Metric'
import Database from '~/models/Database'

export default {
  name: 'MetricDatabaseConfiguration',
  props: {
    metricId: {
      type: String,
      default() {
        return ''
      }
    },
    globalDatabaseSettings: {
      type: Object,
      default() {
        return {
          database: '',
          intervalMin: '',
          intervalMax: '',
          intervalFactor: ''
        }
      }
    },
    showApplyAll: {
      type: Boolean,
      default() {
        return false
      }
    },
    hideSave: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  data() {
    const metric =
      Metric.query()
        .with('database')
        .whereId(this.metricId)
        .first() || this.globalDatabaseSettings
    return {
      databaseSettings: {
        databaseId: metric.databaseId || null,
        intervalMin: metric.intervalMin,
        intervalMax: metric.intervalMax,
        intervalFactor: metric.intervalFactor
      }
    }
  },
  computed: {
    metric() {
      return (
        Metric.query()
          .with('database')
          .whereId(this.metricId)
          .first() || this.globalDatabaseSettings
      )
    },
    intervalMinState() {
      try {
        if (Number(this.databaseSettings.intervalMin)) {
          return true
        }

        timestring(this.databaseSettings.intervalMin, 'ms', null)

        return true
      } catch {
        return false
      }
    },
    intervalMaxState() {
      try {
        if (Number(this.databaseSettings.intervalMax)) {
          return true
        }

        timestring(this.databaseSettings.intervalMax, 'ms', null)

        return true
      } catch {
        return false
      }
    },
    intervalFactorState() {
      if (Number(this.databaseSettings.intervalFactor)) {
        return true
      } else {
        return false
      }
    },
    databases() {
      return Database.query()
        .get()
        .map((value) => {
          return value.id
        })
    }
  },
  watch: {
    globalDatabaseSettings(newVal) {
      if (!this.metric.historic) {
        this.databaseSettings = Object.assign({}, this.databaseSettings, newVal)
      }
    },
    intervalMinState(newVal) {
      if (!newVal) {
        this.$refs.intervalMinFormField.setCustomValidity(
          'Wrong duration string format'
        )
      } else {
        this.$refs.intervalMinFormField.setCustomValidity('')
      }
    },
    intervalMaxState(newVal) {
      if (!newVal) {
        this.$refs.intervalMaxFormField.setCustomValidity(
          'Wrong duration string format'
        )
      } else {
        this.$refs.intervalMaxFormField.setCustomValidity('')
      }
    },
    metric(newVal) {
      Object.assign(this.databaseSettings, {
        databaseId: newVal.databaseId,
        intervalMin: newVal.intervalMin,
        intervalMax: newVal.intervalMax,
        intervalFactor: newVal.intervalFactor
      })
    }
  },
  methods: {
    onApplyToAll() {
      const databaseSettings = {}
      if (this.databaseSettings.databaseId) {
        databaseSettings.databaseId = this.databaseSettings.databaseId
      }
      if (this.intervalMinState) {
        databaseSettings.intervalMin = this.databaseSettings.intervalMin
      }
      if (this.intervalMaxState) {
        databaseSettings.intervalMax = this.databaseSettings.intervalMax
      }
      if (this.intervalFactorState) {
        databaseSettings.intervalFactor = this.databaseSettings.intervalFactor
      }

      this.$emit('metric-database-apply-to-all', databaseSettings)
    },
    save() {
      if (this.hideSave) {
        return
      }
      if (this.metric.historic) {
        return
      }
      if (this.validate()) {
        const data = {
          id: this.metricId,
          ...this.databaseSettings
        }
        Metric.update({
          where: this.metricId,
          data: { saving: true }
        })
        Metric.api()
          .post('/metrics/database', data)
          .then(() => {
            Metric.update({
              where: this.metricId,
              data: { saving: false }
            })
            const metric = Metric.query()
              .with('database')
              .whereId(this.metricId)
              .first()
            Object.assign(this.databaseSettings, {
              databaseId: metric.databaseId,
              intervalMin: metric.intervalMin,
              intervalMax: metric.intervalMax,
              intervalFactor: metric.intervalFactor
            })
            this.$emit('metric-database-saved', metric.databaseId)
          })
      }
    },
    validate() {
      return (
        this.$refs.databaseForm.reportValidity() &&
        this.intervalMinState &&
        this.intervalMaxState
      )
    }
  }
}
</script>

<style scoped />
