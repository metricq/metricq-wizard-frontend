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
    <b-card no-body class="mb-3">
      <b-card-header>
        <b-row>
          <b-col cols="3">
            <b-input-group size="sm" prepend="Load by database">
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
          </b-col>
          <b-col cols="3">
            <b-input-group size="sm" prepend="Load by source">
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
                  variant="primary"
                  @click="loadBySource()"
                >
                  Load
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-col>
          <b-col cols="3">
            <b-input-group size="sm" prepend="Load by transformer">
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
                  variant="primary"
                  @click="loadByTransformer()"
                >
                  Load
                </b-button>
              </b-input-group-append>
            </b-input-group>
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
      </b-card-header>

      <b-card-body v-if="fetchingMetrics" class="p-0 text-center">
        <b-alert variant="info" show class="p-3 m-0">
          <b-spinner varian="primary" label="Loading data..." class="mr-2" />
          Loading data...
        </b-alert>
      </b-card-body>

      <b-card-body v-if="metricCount > 0">
        <b-card title="Filter">
          <b-row>
            <b-col lg="4">
              <b-input-group size="sm" prepend="Filter">
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
            </b-col>
            <b-col>
              <b-input-group prepend="Units">
                <b-form-select
                  id="unitFilter"
                  v-model="filterUnits"
                  :options="metricUnits"
                  :value="null"
                />
              </b-input-group>
            </b-col>
            <b-col>
              <b-input-group prepend="Rate">
                <b-form-select
                  id="rateFilter"
                  v-model="filterRate"
                  :options="metricRates"
                  :value="null"
                />
              </b-input-group>
            </b-col>
            <b-col>
              <b-input-group prepend="DB Status">
                <b-form-select
                  id="historicFilter"
                  v-model="filterHistoric"
                  :options="filterHistoricOptions"
                  :value="null"
                />
              </b-input-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-checkbox id="disableFuzzyInput" v-model="disableFuzzy">
                Only search in Id and Source columns with disabled fuzzy search
              </b-form-checkbox>
            </b-col>
          </b-row>
        </b-card>
      </b-card-body>

      <b-card-body v-if="metricCount > 0">
        <b-card no-body>
          <b-card-header>
            <b-row class="my-1">
              <b-col cols="5">
                <b-button
                  size="sm"
                  @click="$refs.metricTable.selectCurrentPage()"
                >
                  Select this page
                </b-button>
                <b-button
                  size="sm"
                  @click="$refs.metricTable.selectAllFiltered()"
                >
                  Select all (filtered)
                </b-button>
                <b-button
                  size="sm"
                  @click="$refs.metricTable.deselectCurrentPage()"
                >
                  Deselect this page
                </b-button>
                <b-button
                  size="sm"
                  @click="$refs.metricTable.deselectAllFiltered()"
                >
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
          </b-card-header>

          <b-card-text>
            <MetricTable
              ref="metricTable"
              :filter="filterString"
              :historic="filterHistoric"
              :unit="filterUnits"
              :rate="filterRate"
              :page-size="pageSize"
              :disable-fuzzy="disableFuzzy"
              :current-page="currentPage"
              @filtered="onFiltered"
            />
          </b-card-text>
        </b-card>
      </b-card-body>

      <b-card-footer v-if="metricCount > 0">
        <b-row class="pt-1 pb-1">
          <b-col class="lead">
            Total metrics loaded: {{ metricCount }}
            <template v-if="totalRows < metricCount">
              ({{ totalRows }} matching)
            </template>
            <template v-if="selected.length > 0">
              ({{ selected.length }} selected)
            </template>
          </b-col>
          <b-col class="col-auto">
            <b-pagination
              v-model="currentPage"
              :total-rows="totalRows"
              :per-page="pageSize"
              align="center"
              first-number
              last-number
            />
          </b-col>
          <b-col class="text-right">
            <span id="archive-tooltip-target">
              <b-button
                :disabled="selected.length === 0 || numSelectedArchived > 0"
                @click="onArchiveClicked"
              >
                <b-icon-archive />
              </b-button>
            </span>
            <b-tooltip
              v-if="numSelectedArchived > 0"
              target="archive-tooltip-target"
              triggers="hover"
              variant="warning"
            >
              You have selected one ore more metrics that are already archived.
              These metrics cannot be archived again.
            </b-tooltip>
            <b-tooltip
              v-else
              target="archive-tooltip-target"
              triggers="hover"
              variant="dark"
            >
              Archive selected metrics
            </b-tooltip>
            <span id="delete-tooltip-target">
              <b-button
                :disabled="selected.length === 0 || numSelectedHistoric > 0"
                @click="onDeleteClicked"
              >
                <b-icon-trash />
              </b-button>
            </span>
            <b-tooltip
              v-if="numSelectedHistoric > 0"
              target="delete-tooltip-target"
              triggers="hover"
              variant="warning"
            >
              You have selected one ore more metrics that are saved to a
              database. Such metrics cannot be deleted.
            </b-tooltip>
            <b-dropdown
              split
              :split-to="combinedMetricButtonTarget.defaultButton.to"
            >
              <template #button-content>
                <b-icon-calculator />
                {{ combinedMetricButtonTarget.defaultButton.text }}
              </template>
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
                Add min metric from selected
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
                Add max metric from selected
              </b-dropdown-item>
            </b-dropdown>
            <b-dropdown
              split
              :split-to="{
                name: 'metric-database_configuration',
              }"
              :disabled="!hasSelected"
            >
              <template #button-content>
                <b-icon-cloud />
                Add to database
              </template>
              <b-dropdown-item
                :disabled="numSelectedHistoric > 0"
                @click="onSetLiveOnlyClicked"
              >
                <b-icon-cloud-slash />
                Mark as Live-only
              </b-dropdown-item>
            </b-dropdown>
          </b-col>
        </b-row>
      </b-card-footer>
      <b-card-body
        v-if="metricCount === 0 && !fetchingMetrics"
        class="text-center p-0"
      >
        <b-alert variant="warning" show class="m-0">
          No metrics loaded! Please use the controls above.
        </b-alert>
      </b-card-body>
    </b-card>
  </div>
</template>

<script>
import MetricTable from '~/components/MetricTable'
import Metric from '~/models/Metric'
import Database from '~/models/Database'
import Source from '~/models/Source'
import Client from '~/models/Client'
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
        { value: null, text: '--' },
        { value: true, text: 'Saved in DB' },
        { value: 'undefined', text: 'Not saved nor live' },
        { value: false, text: 'Live only' },
      ],
      filterUnits: null,
      filterRate: null,
      loadSelectedDatabase: null,
      loadSelectedSource: null,
      loadSelectedTransformer: null,
      pageSize: 20,
      currentPage: 1,
      totalRows: 0,
      disableFuzzy: false,
    }
  },
  async fetch() {
    await Promise.all([Client.fetchAll(), Database.fetchAll()])
  },
  computed: {
    selected() {
      return Metric.query().with('database').where('selected', true).get()
    },
    numSelectedHistoric() {
      return Metric.query()
        .with('database')
        .where('selected', true)
        .where('historic', true)
        .count()
    },
    numSelectedArchived() {
      return Metric.query()
        .with('database')
        .where('selected', true)
        .where(
          'additionalMetadata',
          (value) => value !== undefined && value.archived !== undefined
        )
        .count()
    },
    hasSelected() {
      return (
        Metric.query().with('database').where('selected', true).count() !== 0
      )
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
            .concat([null])
        )
      )
        .map((value) => {
          if (value == null) {
            return { value: null, text: '--' }
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
    fetchingMetrics() {
      return Metric.store().state.entities.metric.fetching
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
            return { value: null, text: '--' }
          } else {
            return { value, text: `${value}` }
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
    combinedMetricButtonTarget() {
      const emptyMetricButton = {
        text: 'Add combined metric',
        to: {
          name: 'metric-create_combined_metric',
        },
      }
      const sumMetricButton = {
        text: 'Add sum metric from selected',
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
  methods: {
    onFiltered(_filteredItems, filteredItemsCount) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItemsCount

      // We need to update the currentPage to be within the bounds
      // of the filtered items. But, we shouldn't change the page
      // unless it is absolutely necessary, because this method
      // will also be called, when a user selects a metric.
      this.currentPage = Math.min(
        this.currentPage,
        Math.ceil(filteredItemsCount / this.pageSize)
      )
    },
    async onDeleteClicked() {
      if (this.numSelectedHistoric > 0) {
        this.$toast.error(
          'Cannot delete metrics that are saved to any database!'
        )
      } else {
        // You think this is ugly? Yes it is, but it's the only way to get an
        // awaitable modal box with HTML in it.
        // https://bootstrap-vue.org/docs/components/modal#message-box-notes
        // "The Message Box message currently does not support HTML strings,
        // however, you can pass an array of VNodes [...]"

        // make a list of the first 10 metrics to be deleted
        const metricList = this.selected
          .slice(0, 10)
          .map((metric) => this.$createElement('li', metric.id))

        // if there are more than 10 metrics to be deleted, add "and x more ..."
        if (this.selected.length > 10) {
          metricList.push(
            this.$createElement(
              'li',
              `and ${this.selected.length - 10} more ...`
            )
          )
        }

        const confirmed = await this.$bvModal.msgBoxConfirm(
          [this.$createElement('ul', metricList)],
          {
            titleHtml: `Are you sure you want to delete <b>${this.selected.length}</b> metrics?`,
            buttonSize: 'sm',
            okVariant: 'danger',
            okTitle: 'Yes, delete',
            cancelTitle: 'No, cancel',
            footerClass: 'p-2',
            hideHeaderClose: false,
            centered: true,
          }
        )

        if (confirmed) {
          const response = await Metric.deleteMetadata(
            this.selected.map((metric) => metric.id)
          )

          if (response.status === 200) {
            this.$toast.success('Successfully deleted metrics!')
          } else {
            const { data } = response
            if (data.status === 'partial') {
              this.$toast.error(
                `Failed to delete ${data.failed.length} of ${
                  data.failed.length + data.deleted.length
                } metrics!`
              )
            } else {
              // Unless response.status === 500, this case would be a bug
              // in the frontend, as it would indicate an invalid request.
              this.$toast.error(`Failed to delete metrics!`)
            }
          }
        }
      }
    },
    async onArchiveClicked() {
      if (this.numSelectedArchived > 0) {
        this.$toast.error(
          'Cannot archive metrics that are saved to any database!'
        )
      } else {
        // You think this is ugly? Yes it is, but it's the only way to get an
        // awaitable modal box with HTML in it.
        // https://bootstrap-vue.org/docs/components/modal#message-box-notes
        // "The Message Box message currently does not support HTML strings,
        // however, you can pass an array of VNodes [...]"

        // make a list of the first 10 metrics to be deleted
        const metricList = this.selected
          .slice(0, 10)
          .map((metric) => this.$createElement('li', metric.id))

        // if there are more than 10 metrics to be deleted, add "and x more ..."
        if (this.selected.length > 10) {
          metricList.push(
            this.$createElement(
              'li',
              `and ${this.selected.length - 10} more ...`
            )
          )
        }

        const confirmed = await this.$bvModal.msgBoxConfirm(
          [this.$createElement('ul', metricList)],
          {
            titleHtml: `Are you sure you want to archive <b>${this.selected.length}</b> metrics?`,
            buttonSize: 'sm',
            okVariant: 'danger',
            okTitle: 'Yes, archive',
            cancelTitle: 'No, cancel',
            footerClass: 'p-2',
            hideHeaderClose: false,
            centered: true,
          }
        )

        if (confirmed) {
          try {
            // I know what you think: why don't you use the fancy Vuex-ORM instead?
            // Because it is Vuex-orm. I'm done with that and I wish I hadn't to deal
            // with it
            await this.$axios.post('/metrics/archive', {
              metrics: this.selected.map((metric) => metric.id),
            })

            // TODO Update Metrics. Can I just reload? Please? (╥_╥)

            this.$toast.success('Successfully archived metrics!')
          } catch ({ response }) {
            const { data } = response
            if (data.status === 'partial') {
              this.$toast.error(
                `Failed to archive ${data.failed.length} of ${
                  data.failed.length + data.deleted.length
                } metrics!`
              )
            } else {
              // Unless response.status === 500, this case would be a bug
              // in the frontend, as it would indicate an invalid request.
              this.$toast.error(`Failed to archive metrics!`)
            }
          }
        }
      }
    },
    async onSetLiveOnlyClicked() {
      if (this.numSelectedHistoric > 0) {
        this.$toast.error(
          'Cannot set metrics to Live-Only that are saved to any database!'
        )
      } else {
        // You think this is ugly? Yes it is, but it's the only way to get an
        // awaitable modal box with HTML in it.
        // https://bootstrap-vue.org/docs/components/modal#message-box-notes
        // "The Message Box message currently does not support HTML strings,
        // however, you can pass an array of VNodes [...]"

        // make a list of the first 10 metrics to be deleted
        const metricList = this.selected
          .slice(0, 10)
          .map((metric) => this.$createElement('li', metric.id))

        // if there are more than 10 metrics to be deleted, add "and x more ..."
        if (this.selected.length > 10) {
          metricList.push(
            this.$createElement(
              'li',
              `and ${this.selected.length - 10} more ...`
            )
          )
        }

        const confirmed = await this.$bvModal.msgBoxConfirm(
          [this.$createElement('ul', metricList)],
          {
            titleHtml: `Are you sure you want to set <b>${this.selected.length}</b> metrics to Live-Only?`,
            buttonSize: 'sm',
            okVariant: 'danger',
            okTitle: "Yes, I don't want to store them",
            cancelTitle: 'No, cancel',
            footerClass: 'p-2',
            hideHeaderClose: false,
            centered: true,
          }
        )

        if (confirmed) {
          const response = await Metric.setLiveOnly(
            this.selected.map((metric) => metric.id)
          )

          if (response.status === 200) {
            this.$toast.success('Successfully updated all metrics!')
          } else {
            const { data } = response
            if (data.status === 'partial') {
              this.$toast.error(
                `Failed to update ${data.failed.length} out of ${
                  data.failed.length + data.deleted.length
                } metrics!`
              )
            } else {
              // Unless response.status === 500, this case would be a bug
              // in the frontend, as it would indicate an invalid request.
              this.$toast.error(`Failed to update metrics!`)
            }
          }
        }
      }
    },
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
          dataTransformer: Metric.convertMetricListResponse,
        }
      )
      Metric.commit((state) => {
        state.fetching = false
      })
    },
    async clearMetricList() {
      await Metric.deleteAll()
      this.resetFilterSettings()
    },
    resetFilterSettings() {
      this.filterUnits = null
      this.filterRate = null
      this.filterHistoric = null
      this.filterString = ''
    },
  },
}
</script>

<style />
