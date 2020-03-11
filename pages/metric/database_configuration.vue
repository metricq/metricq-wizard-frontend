<template>
  <div>
    <b-row>
      <b-col>
        <h1>Metrics Database Configuration</h1>
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="2">
        <b-form-group
          label="Database"
          label-cols="4"
          label-align="right"
          label-for="selectDatabase"
          class="mb-0"
        >
          <b-form-select
            id="selectDatabase"
            v-model="selectedDatabase"
            :options="databases"
            :value="null"
            required
            class="w-100"
          >
            <template v-slot:first>
              <b-form-select-option :value="null" disabled>
                Choose...
              </b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-form ref="databaseForm">
          <b-table
            ref="metricListTable"
            v-model="currentTableItems"
            :items="selected"
            :fields="fields"
            :per-page="perPage"
            :current-page="currentPage"
            small
            primary-key="id"
            responsive="true"
            sort-icon-left
            striped
            hover
            show-empty
          >
            <template v-slot:cell(intervalMin)="data">
              <b-form-input
                :id="'input-interval-min-' + data.item.id"
                :ref="'input-interval-min-' + data.item.id"
                v-model="data.item.intervalMin"
                :state="
                  verifyInterval(
                    'input-interval-min-' + data.item.id,
                    data.item.intervalMin
                  )
                "
                :disabled="data.item.historic"
                required
                size="sm"
                placeholder="duration, e.g. 10s"
              />
            </template>
            <template v-slot:cell(intervalMax)="data">
              <b-form-input
                :id="'input-interval-max-' + data.item.id"
                :ref="'input-interval-max-' + data.item.id"
                v-model="data.item.intervalMax"
                :state="
                  verifyInterval(
                    'input-interval-max-' + data.item.id,
                    data.item.intervalMax
                  )
                "
                :disabled="data.item.historic"
                required
                size="sm"
                placeholder="duration, e.g. 10s"
              />
            </template>
            <template v-slot:cell(intervalFactor)="data">
              <b-form-input
                :id="'input-interval-factor-' + data.item.id"
                ref="intervalMinFormField"
                v-model="data.item.intervalFactor"
                :state="verifyIntervalFactor(data.item.intervalFactor)"
                :disabled="data.item.historic"
                type="number"
                required
                size="sm"
                placeholder="10"
              />
            </template>
          </b-table>
        </b-form>
      </b-col>
    </b-row>
    <b-row class="mb-2">
      <b-col>
        <b-button
          :to="{
            name: 'metric-metric_list'
          }"
          variant="danger"
        >
          Cancel
        </b-button>
      </b-col>
      <b-col>
        <b-pagination
          v-model="currentPage"
          :total-rows="rows"
          :per-page="perPage"
          align="center"
          first-number
          last-number
        />
      </b-col>
      <b-col>
        <b-button
          variant="primary"
          :disabled="saving || !selectedDatabase"
          class="float-right"
          @click="saveAll"
        >
          <b-spinner v-if="saving" class="ml-auto" small />
          Save database settings for all metrics
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import timestring from 'timestring'
import Metric from '~/models/Metric'
import Database from '~/models/Database'

export default {
  components: {},
  async asyncData() {
    const selectedMetrics = Metric.query()
      .where('selected', true)
      .all()
      .map((value) => value.id)
    Metric.commit((state) => {
      state.fetching = true
    })
    await Metric.api()
      .post('/metrics/database/defaults', {
        selectedMetrics
      })
      .finally(() => {
        Metric.commit((state) => {
          state.fetching = false
        })
      })
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
    return {
      selectedDatabase: null,
      currentTableItems: [],
      perPage: 20,
      currentPage: 1,
      errorCount: 0,
      fields: [
        { key: 'id', sortable: true },
        { key: 'intervalMin' },
        { key: 'intervalMax' },
        { key: 'intervalFactor' }
      ]
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
    },
    databases() {
      return Database.query()
        .get()
        .map((value) => {
          return value.id
        })
    },
    rows() {
      return this.selected.length
    }
  },
  watch: {
    saving(newValue, oldValue) {
      if (
        newValue === false &&
        oldValue === true &&
        this.errorCount < this.rows
      ) {
        this.$bvModal
          .msgBoxConfirm(
            `Reconfigure following database?\n${this.selectedDatabase}`,
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
              console.log(`Restarting ${this.selectedDatabase}`)
              Database.api().reconfigureById(this.selectedDatabase)
            } else {
              console.log('Do not restart database')
            }
          })
      }
    }
  },
  methods: {
    saveAll() {
      if (!this.selectedDatabase) {
        return
      }
      if (!this.$refs.databaseForm.reportValidity()) {
        return
      }
      this.errorCount = 0
      this.selected.forEach((metric) => {
        if (metric.historic) {
          return
        }
        const data = {
          id: metric.id,
          databaseId: this.selectedDatabase,
          intervalMin: metric.intervalMin,
          intervalMax: metric.intervalMax,
          intervalFactor: metric.intervalFactor
        }
        Metric.update({
          where: metric.id,
          data: { saving: true }
        })
        Metric.api()
          .post('/metrics/database', data)
          .catch(() => {
            this.errorCount++
            this.$toast.error(
              `Saving database configuration for metric ${metric.id} failed!`
            )
          })
          .finally(() => {
            Metric.update({
              where: metric.id,
              data: { saving: false }
            })
          })
      })
    },
    verifyInterval(ref, interval) {
      try {
        if (Number(interval)) {
          if (this.$refs[ref]) {
            this.$refs[ref].setCustomValidity('')
          }
          return true
        }

        timestring(interval, 'ms', null)
        if (this.$refs[ref]) {
          this.$refs[ref].setCustomValidity('')
        }
        return true
      } catch {
        if (this.$refs[ref]) {
          this.$refs[ref].setCustomValidity('Wrong duration string format')
        }
        return false
      }
    },
    verifyIntervalFactor(factor) {
      return !!Number(factor)
    }
  }
}
</script>

<style scoped />
