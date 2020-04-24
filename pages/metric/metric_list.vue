<template>
  <div>
    <b-row>
      <b-col>
        <h1>Metrics Overview</h1>
      </b-col>
    </b-row>
    <b-card>
      <b-row>
        <b-col cols="3">
          <b-form-group
            label="Load by database"
            label-cols-sm="4"
            label-align-sm="right"
            label-size="sm"
            label-for="loadByDatabase"
            class="mb-0"
          >
            <b-input-group size="sm">
              <b-form-select
                id="loadByDatabase"
                v-model="loadSelectedDatabase"
                :options="databases"
                :value="null"
                disabled
              >
                <template v-slot:first>
                  <b-form-select-option :value="null" disabled>
                    Choose...
                  </b-form-select-option>
                </template>
              </b-form-select>
              <b-input-group-append>
                <b-button
                  :disabled="!loadSelectedDatabase"
                  @click="loadByDatabase()"
                >
                  Load
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="3">
          <b-form-group
            label="Load by source"
            label-cols-sm="4"
            label-align-sm="right"
            label-size="sm"
            label-for="loadBySource"
            class="mb-0"
          >
            <b-input-group size="sm">
              <b-form-select
                id="loadBySource"
                v-model="loadSelectedSource"
                :options="sources"
                :value="null"
              >
                <template v-slot:first>
                  <b-form-select-option :value="null" disabled>
                    Choose...
                  </b-form-select-option>
                </template>
              </b-form-select>
              <b-input-group-append>
                <b-button
                  :disabled="!loadSelectedSource"
                  @click="loadBySource()"
                >
                  Load
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="3">
          <b-form-group
            label="Load by transformer"
            label-cols-sm="4"
            label-align-sm="right"
            label-size="sm"
            label-for="loadByTransformer"
            class="mb-0"
          >
            <b-input-group size="sm">
              <b-form-select
                id="loadByTransformer"
                v-model="loadSelectedTransformer"
                :options="transformers"
                :value="null"
              >
                <template v-slot:first>
                  <b-form-select-option :value="null" disabled>
                    Choose...
                  </b-form-select-option>
                </template>
              </b-form-select>
              <b-input-group-append>
                <b-button
                  :disabled="!loadSelectedTransformer"
                  @click="loadByTransformer()"
                >
                  Load
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col>
          <b-button
            class="float-right"
            :disabled="metricCount == 0"
            size="sm"
            @click="clearMetricList()"
          >
            Clear metric list
          </b-button>
        </b-col>
      </b-row>
    </b-card>
    <b-row class="my-1">
      <b-col cols="5">
        <b-button size="sm" @click="$refs.metricTable.selectCurrentPage()">
          Select this page
        </b-button>
        <b-button size="sm" @click="$refs.metricTable.selectAllFiltered()">
          Select all (filtered)
        </b-button>
        <b-button size="sm" @click="$refs.metricTable.deselectCurrentPage()">
          Deselect this page
        </b-button>
        <b-button size="sm" @click="$refs.metricTable.deselectAllFiltered()">
          Deselect all (filtered)
        </b-button>
        <b-button
          size="sm"
          variant="danger"
          @click="$refs.metricTable.deselectAll()"
        >
          Deselect all
        </b-button>
      </b-col>
      <b-col>
        <b-form-group
          label="Items per page"
          label-cols="8"
          label-align="right"
          label-for="selectPageSize"
          label-size="sm"
        >
          <b-form-select
            id="selectPageSize"
            v-model="pageSize"
            :options="[10, 20, 50, 100, 500]"
            size="sm"
          />
        </b-form-group>
      </b-col>
      <b-col lg="5">
        <b-form-group
          label="Filter"
          label-cols-sm="3"
          label-align-sm="right"
          label-size="sm"
          label-for="filterInput"
          class="mb-0"
        >
          <b-input-group size="sm">
            <b-form-input
              id="filterInput"
              v-model="filterString"
              type="search"
              debounce="100"
              placeholder="Type to Filter"
              size="sm"
            />
            <b-input-group-append>
              <b-button
                :disabled="!filterString"
                size="sm"
                @click="filterString = ''"
              >
                Clear
              </b-button>
            </b-input-group-append>
            <b-form-select
              id="historicFilter"
              v-model="filterHistoric"
              :options="filterHistoricOptions"
              :value="null"
            />
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>
    <MetricTable
      ref="metricTable"
      :filter="filterString"
      :historic="filterHistoric"
      :page-size="pageSize"
    />
    <b-row class="pt-1 pb-1">
      <b-col />
      <b-col cols="2" align="right">
        <b-button
          :to="{
            name: 'metric-database_configuration',
          }"
          :disabled="selected.length === 0"
        >
          Configure database
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import MetricTable from '~/components/MetricTable'
import Metric from '~/models/Metric'
import Database from '~/models/Database'
import Source from '~/models/Source'
import Transformer from '~/models/Transformer'

export default {
  components: {
    MetricTable,
  },
  data() {
    return {
      filterString: '',
      filterHistoric: null,
      filterHistoricOptions: [
        { value: null, text: 'Any' },
        { value: true, text: 'Saved in DB' },
        { value: false, text: 'Not in DB' },
      ],
      loadSelectedDatabase: null,
      loadSelectedSource: null,
      loadSelectedTransformer: null,
      pageSize: 20,
    }
  },
  computed: {
    selected() {
      return Metric.query().with('database').where('selected', true).get()
    },
    metricCount() {
      return Metric.query().count()
    },
    databases() {
      return Database.query()
        .all()
        .map((item) => item.id)
    },
    sources() {
      return Source.query()
        .all()
        .map((item) => item.id)
    },
    transformers() {
      return Transformer.query()
        .all()
        .map((item) => item.id)
    },
  },
  async mounted() {
    Database.commit((state) => {
      state.fetching = true
    })
    Database.api()
      .get('/databases')
      .finally(() => {
        Database.commit((state) => {
          state.fetching = false
        })
      })
    Source.commit((state) => {
      state.fetching = true
    })
    await Source.api()
      .get('/sources')
      .finally(() => {
        Source.commit((state) => {
          state.fetching = false
        })
      })
    Transformer.commit((state) => {
      state.fetching = true
    })
    await Transformer.api()
      .get('/transformers')
      .finally(() => {
        Transformer.commit((state) => {
          state.fetching = false
        })
      })
  },
  methods: {
    async loadByDatabase() {
      Metric.commit((state) => {
        state.fetching = true
      })
      await Metric.api().post('/metrics', {
        database: this.loadSelectedDatabase,
      })
      Metric.commit((state) => {
        state.fetching = false
      })
    },
    async loadBySource() {
      Metric.commit((state) => {
        state.fetching = true
      })
      await Metric.api().post('/metrics', {
        source: this.loadSelectedSource,
      })
      Metric.commit((state) => {
        state.fetching = false
      })
    },
    async loadByTransformer() {
      Metric.commit((state) => {
        state.fetching = true
      })
      await Metric.api().post('/metrics', {
        source: this.loadSelectedTransformer,
      })
      Metric.commit((state) => {
        state.fetching = false
      })
    },
    async clearMetricList() {
      await Metric.deleteAll()
    },
  },
}
</script>

<style />
