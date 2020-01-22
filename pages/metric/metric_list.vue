<template>
  <b-container fluid>
    <div>
      <b-row>
        <b-col />
        <b-col lg="6" class="my-1">
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
                v-model="filterString"
                type="search"
                id="filterInput"
                debounce="100"
                placeholder="Type to Search"
              />
              <b-input-group-append>
                <b-button :disabled="!filterString" @click="filterString = ''"
                  >Clear</b-button
                >
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
      <MetricTable :filter="filterString" :historic="filterHistoric" />
      <b-row>
        <b-col />
        <b-col cols="2" align="right">
          <b-button
            :to="{
              name: 'metric-database_configuration'
            }"
            :disabled="selected.length === 0"
          >
            Configure database
          </b-button>
        </b-col>
      </b-row>
    </div>
  </b-container>
</template>

<script>
import MetricTable from '~/components/MetricTable'
import Metric from '~/models/Metric'
import Database from '~/models/Database'

export default {
  components: {
    MetricTable
  },
  data() {
    return {
      filterString: '',
      filterHistoric: null,
      filterHistoricOptions: [
        { value: null, text: 'Any' },
        { value: true, text: 'Saved in DB' },
        { value: false, text: 'Not in DB' }
      ]
    }
  },
  computed: {
    selected() {
      return Metric.query()
        .with('database')
        .where('selected', true)
        .get()
    }
  },
  async mounted() {
    if (
      this.$route.params.loadMetrics == null ||
      this.$route.params.loadMetrics
    ) {
      Metric.commit((state) => {
        state.fetching = true
      })
      await Metric.api()
        .get('/metrics')
        .finally(() => {
          Metric.commit((state) => {
            state.fetching = false
          })
        })
    }
    Database.commit((state) => {
      state.fetching = true
    })
    await Database.api()
      .get('/databases')
      .finally(() => {
        Database.commit((state) => {
          state.fetching = false
        })
      })
  },
  methods: {}
}
</script>

<style />
