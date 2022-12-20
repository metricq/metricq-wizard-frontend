<template>
  <div>
    <b-row>
      <b-col>
        <h1>
          Metric Workshop 🧰
          <span class="lead">
            Configure metric transformation, combination, and persistance
          </span>
        </h1>
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
                <template #first>
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
                <template #first>
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
                <template #first>
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
    <b-card title="Filter">
      <b-row>
        <b-col lg="4">
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
          </b-input-group>
          <b-form-checkbox id="disableFuzzyInput" v-model="disableFuzzy">
            Only search id and source with disabled fuzzy search
          </b-form-checkbox>
        </b-col>
        <b-col>
          <b-form-group
            label="Units"
            label-cols-sm="3"
            label-align-sm="right"
            label-for="filterInput"
            class="mb-0"
          >
            <b-form-select
              id="unitFilter"
              v-model="filterUnits"
              :options="metricUnits"
              :value="null"
            />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="Rate"
            label-cols-sm="3"
            label-align-sm="right"
            label-for="rateFilter"
            class="mb-0"
          >
            <b-form-select
              id="rateFilter"
              v-model="filterRate"
              :options="metricRates"
              :value="null"
            />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="DB Status"
            label-cols-sm="3"
            label-align-sm="right"
            label-for="filterInput"
            class="mb-0"
          >
            <b-form-select
              id="historicFilter"
              v-model="filterHistoric"
              :options="filterHistoricOptions"
              :value="null"
            />
          </b-form-group>
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
    </b-row>
    <MetricTable
      ref="metricTable"
      :filter="filterString"
      :historic="filterHistoric"
      :unit="filterUnits"
      :rate="filterRate"
      :page-size="pageSize"
      :disable-fuzzy="disableFuzzy"
    />
    <b-row class="pt-1 pb-1">
      <b-col />
      <b-col>
        <b-button
          :to="{
            name: 'metric-database_configuration',
          }"
          :disabled="selected.length === 0"
          class="float-right"
        >
          Configure database
        </b-button>
        <b-dropdown
          split
          :split-to="combinedMetricButtonTarget.defaultButton.to"
          :text="combinedMetricButtonTarget.defaultButton.text"
          class="float-right mr-1"
        >
          <b-dropdown-item
            :to="combinedMetricButtonTarget.firstButton.to"
            :disabled="selected.length === 0"
          >
            {{ combinedMetricButtonTarget.firstButton.text }}
          </b-dropdown-item>
          <b-dropdown-item
            :to="{
              name: 'metric-create_combined_metric',
              params: {
                expression: {
                  operation: 'min',
                  inputs: selected.map((item) => item.id),
                },
              },
            }"
            :disabled="selected.length === 0"
          >
            Create min metric from selected
          </b-dropdown-item>
          <b-dropdown-item
            :to="{
              name: 'metric-create_combined_metric',
              params: {
                expression: {
                  operation: 'max',
                  inputs: selected.map((item) => item.id),
                },
              },
            }"
            :disabled="selected.length === 0"
          >
            Create max metric from selected
          </b-dropdown-item>
        </b-dropdown>
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
      filterUnits: null,
      filterRate: null,
      loadSelectedDatabase: null,
      loadSelectedSource: null,
      loadSelectedTransformer: null,
      pageSize: 20,
      disableFuzzy: false,
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
    metricUnits() {
      return Array.from(
        new Set(
          Metric.query()
            .all()
            .map((value) => {
              if (value.unit === undefined) {
                return null
              } else {
                return value.unit
              }
            })
        )
      )
        .map((value) => {
          if (value == null) {
            return { value: null, text: 'Any' }
          } else {
            return { value, text: value }
          }
        })
        .sort(({ text: aText }, { text: bText }) => {
          if (aText < bText) {
            return -1
          }
          if (aText > bText) {
            return 1
          }

          return 0
        })
    },
    metricRates() {
      return Array.from(
        new Set(
          Metric.query()
            .all()
            .map((value) => {
              if (value.rate === undefined) {
                return null
              } else {
                return value.rate
              }
            })
            .concat([null])
        )
      )
        .map((value) => {
          if (value == null) {
            return { value: null, text: 'Any' }
          } else {
            return { value, text: value }
          }
        })
        .sort()
    },
    combinedMetricButtonTarget() {
      const emptyMetricButton = {
        text: 'Create new combined metric',
        to: {
          name: 'metric-create_combined_metric',
        },
      }
      const sumMetricButton = {
        text: 'Create sum metric from selected',
        to: {
          name: 'metric-create_combined_metric',
          params: {
            expression: {
              operation: 'sum',
              inputs: this.selected.map((item) => item.id),
            },
          },
        },
      }
      return {
        defaultButton:
          this.selected.length === 0 ? emptyMetricButton : sumMetricButton,
        firstButton:
          this.selected.length === 0 ? sumMetricButton : emptyMetricButton,
      }
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
      await Metric.api().post(
        '/metrics',
        {
          database: this.loadSelectedDatabase,
        },
        {
          dataTransformer: Metric.convertMetricListResponse,
        }
      )
      Metric.commit((state) => {
        state.fetching = false
      })
    },
    async loadBySource() {
      Metric.commit((state) => {
        state.fetching = true
      })
      await Metric.api().post(
        '/metrics',
        {
          source: this.loadSelectedSource,
        },
        {
          dataTransformer: Metric.convertMetricListResponse,
        }
      )
      Metric.commit((state) => {
        state.fetching = false
      })
    },
    async loadByTransformer() {
      Metric.commit((state) => {
        state.fetching = true
      })
      await Metric.api().post(
        '/metrics',
        {
          source: this.loadSelectedTransformer,
        },
        {
          dataTransformer: (response) => {
            return Metric.convertMetricListResponse(response).map(
              (currentValue) => {
                return {
                  ...currentValue,
                  sourceType: 'transformer',
                }
              }
            )
          },
        }
      )
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