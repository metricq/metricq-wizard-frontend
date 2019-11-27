<template>
  <b-card :header="metric.id" :sub-title="metric.description">
    <b-form ref="databaseForm" inline class="mb-2" align="right">
      <b-form-group class="w-25 mr-sm-2">
        <label class="" for="inline-form-custom-select-pref">Database</label>
        <b-form-select
          id="inline-form-custom-select-pref"
          v-model="databaseSettings.databaseId"
          :options="databases"
          :value="null"
          :disabled="metric.historic"
          class="w-100"
          required
        >
          <template v-slot:first>
            <option :value="null">Choose...</option>
          </template>
        </b-form-select>
      </b-form-group>
      <b-form-group class="mr-sm-2">
        <label for="input-1">Minimal aggregation interval:</label>
        <b-form-input
          id="input-1"
          ref="intervalMinFormField"
          v-model="databaseSettings.intervalMin"
          :state="intervalMinState"
          :disabled="metric.historic"
          required
          placeholder="duration, e.g. 10s"
        ></b-form-input>
      </b-form-group>
      <b-form-group class="mr-sm-2">
        <label for="input-2">Maximal aggregation interval:</label>
        <b-form-input
          id="input-2"
          ref="intervalMaxFormField"
          v-model="databaseSettings.intervalMax"
          :state="intervalMaxState"
          :disabled="metric.historic"
          required
          placeholder="duration, e.g. 365d"
        />
      </b-form-group>
      <b-form-group class="mr-sm-2">
        <label for="input-3">Aggregation interval factor:</label>
        <b-form-input
          id="input-3"
          v-model="databaseSettings.intervalFactor"
          :state="intervalFactorState"
          :disabled="metric.historic"
          type="number"
          required
          placeholder="10"
        ></b-form-input>
      </b-form-group>
      <b-form-group align="right">
        <label>&nbsp;</label>
        <b-button :disabled="metric.historic" type="reset" variant="danger">
          Reset to defaults
        </b-button>
        <b-button @click="onApplyToAll" variant="primary">
          Apply to all
        </b-button>
        <b-button @click="save" :disabled="metric.historic" variant="primary">
          Save
        </b-button>
      </b-form-group>
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
    }
  },
  data() {
    const metric = Metric.query()
      .with('database')
      .whereId(this.metricId)
      .first()
    return {
      databaseSettings: {
        databaseId: metric.databaseId,
        intervalMin: metric.intervalMin,
        intervalMax: metric.intervalMax,
        intervalFactor: metric.intervalFactor
      }
    }
  },
  computed: {
    metric() {
      return Metric.query()
        .with('database')
        .whereId(this.metricId)
        .first()
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
        this.databaseSettings = { ...newVal }
      }
    },
    intervalMinState(newVal, oldVal) {
      if (!newVal) {
        this.$refs.intervalMinFormField.setCustomValidity(
          'Wrong duration string format'
        )
      } else {
        this.$refs.intervalMinFormField.setCustomValidity('')
      }
    },
    intervalMaxState(newVal, oldVal) {
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
      if (this.validate()) {
        this.$emit('metric-database-apply-to-all', this.databaseSettings)
      }
    },
    save() {
      if (this.validate()) {
        const data = {
          id: this.metricId,
          ...this.databaseSettings
        }
        Metric.api()
          .post('/metrics/database', data)
          .then(() => {
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

<style scoped></style>
