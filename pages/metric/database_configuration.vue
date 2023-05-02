<template>
  <div>
    <b-row>
      <b-col>
        <h1>Metrics Database Configuration</h1>
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="4">
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
            :state="!!selectedDatabase"
            :value="null"
            required
            class="w-100"
          >
            <template #first>
              <b-form-select-option :value="null" disabled>
                Choose...
              </b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>
      <b-col />
      <b-col cols="3">
        <b-form-group
          label="Items per page"
          label-cols="8"
          label-align="right"
          label-for="selectPageSize"
        >
          <b-form-select
            id="selectPageSize"
            v-model="perPage"
            :options="[10, 20, 50, 100, 500]"
          />
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
            <template #cell(intervalMin)="data">
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
            <template #cell(intervalMax)="data">
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
            <template #cell(intervalFactor)="data">
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
            name: 'metric-configure',
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
          :disabled="saveInProgress || !selectedDatabase"
          class="float-right"
          @click="saveAll"
        >
          <b-spinner v-if="saveInProgress" class="ml-auto" small />
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
import Client from '~/models/Client'

export default {
  components: {},
  layout: 'nonfluid',
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
        selectedMetrics,
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
        selectedMetrics,
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
        { key: 'intervalFactor' },
      ],
      saveInProgress: false,
    }
  },
  computed: {
    selected() {
      return Metric.query().with('database').where('selected', true).all()
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
    },
  },
  methods: {
    async saveAll() {
      if (!this.selectedDatabase) {
        return
      }
      if (!this.$refs.databaseForm.reportValidity()) {
        return
      }

      this.saveInProgress = true

      const databaseConfigurations = this.selected
        .filter((metric) => !metric.historic)
        .map((metric) => ({
          id: metric.id,
          databaseId: this.selectedDatabase,
          intervalMin: metric.intervalMin,
          intervalMax: metric.intervalMax,
          intervalFactor: metric.intervalFactor,
        }))

      const { response } = await Metric.api().post(
        '/metrics/database',
        {
          databaseConfigurations,
        },
        {
          validateStatus: null,
          save: false,
        }
      )

      if (response.status !== 200) {
        this.$toast.error(`Saving database configurations failed!`)
        this.saveInProgress = false
        return
      }

      // Fake historic attribute for added metrics to make them appear updated
      // In the actual metadata, they are only marked as historic when the
      // corresponding database is reconfigured.
      this.selected.forEach((metric) => {
        Metric.update({
          where: metric.id,
          data: { historic: true },
        })
      })

      const shouldReconfigure = await this.$bvModal.msgBoxConfirm(
        [
          'Reconfigure the database ',
          this.$createElement('b', this.selectedDatabase),
          ' now?',
        ],
        {
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'YES',
          cancelTitle: 'NO',
          footerClass: 'p-2',
          centered: true,
        }
      )

      if (shouldReconfigure) {
        // the database gets selected from a dropdown filled with all databases
        // so it should be safe to assume that the database exists
        const database = Client.find(this.selectedDatabase)

        const { response } = await database.reconfigure()
        if (response.status === 200) {
          this.$toast.success('Successfully reconfigured the database!')
        } else {
          this.$toast.error('Failed to reconfigure the database!')
        }
      }

      await this.$router.push({
        name: 'metric-configure',
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
    },
  },
}
</script>

<style scoped />
