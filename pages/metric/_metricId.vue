<template>
  <div class="metricLibrary d-flex flex-column">
    <b-row>
      <b-col>
        <h1>
          Metric Library 📚
          <span class="lead">
            Gather information about the one given metric
          </span>
        </h1>
      </b-col>
    </b-row>

    <b-row class="pb-3 flex-grow-1">
      <b-col align="center" class="d-flex flex-column">
        <b-card no-body class="flex-grow-1">
          <b-card-header>
            <b-input-group prepend="Metric" size="sm">
              <b-input
                ref="metricInput"
                v-model="metric"
                class="searchBox"
                placeholder="Enter metric name"
                debounce="500"
                type="search"
                :state="isValidMetric()"
                :autofocus="true"
                @click="onSearchClick()"
              />
              <b-input-group-append>
                <b-button :disabled="!metric" @click="metric = ''"
                  >Clear</b-button
                >
              </b-input-group-append>
            </b-input-group>
          </b-card-header>
          <ul v-if="!hasSelectedMetric()" class="autocomplete-results">
            <li
              v-for="match in matchingMetrics"
              :key="match.id"
              class="autocomplete-result"
              @click="onMetricSelect(match.id)"
            >
              {{ match.id }} - {{ match.description }}
            </li>
          </ul>

          <b-card-body
            v-if="hasSelectedMetric()"
            align="center"
            class="d-flex flex-column"
          >
            <b-card-group deck>
              <b-card no-body class="h-100" header="Metadata">
                <b-card-text>
                  <json-tree :data="selectedMetricMetadata" />
                </b-card-text>
              </b-card>
              <b-card no-body class="h-100" header="Source">
                <b-card-body>
                  <b-row>
                    <b-col align="left">
                      <span class="lead">
                        {{ selectedMetric.source }}
                      </span>
                    </b-col>
                    <b-col>
                      <client-actions
                        v-if="getMetricSource(selectedMetric.source)"
                        :client="getMetricSource(selectedMetric.source)"
                      />
                    </b-col>
                  </b-row>
                </b-card-body>
              </b-card>
              <b-card no-body header="Consumers">
                <b-list-group flush class="h-100">
                  <b-list-group-item
                    v-for="consumer in selectedMetricConsumers"
                    :key="consumer"
                    align="left"
                  >
                    <span class="lead">
                      {{ consumer }}
                    </span>
                  </b-list-group-item>
                </b-list-group>
              </b-card>
            </b-card-group>

            <b-card no-body header="Live Data Points" class="mt-4 flex-grow-1">
              <b-card-body>
                <apexchart
                  type="line"
                  height="100%"
                  :options="chartOptions"
                  :series="metricLiveData"
                />
              </b-card-body>
            </b-card>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import MetricQLive from '@metricq/live'

import ClientActions from '~/components/ClientActions.vue'
import Metric from '~/models/Metric'
import Source from '~/models/Source'

export default {
  components: { ClientActions },
  asyncComputed: {
    matchingMetrics: {
      async get() {
        const result = await Metric.api().get('/metrics', {
          params: {
            infix: this.metric,
            limit: 100,
          },
          save: false,
          dataTransformer: Metric.convertMetricListResponse,
        })
        return result.getDataFromResponse()
      },
      default: [],
    },
    selectedMetricConsumers: {
      async get() {
        if (!this.hasSelectedMetric()) return []

        return (await this.$axios.get(`/metric/${this.metric}/consumers`)).data
      },
      default: [],
    },
  },
  asyncData({ params }) {
    return {
      metric: params.metricId,
      metricLiveData: [{ data: [] }],
      metricqWebsocket: null,
      chartOptions: {
        chart: {
          id: 'metricLiveChart',
          animations: {
            enabled: false,
          },
          toolbar: {
            show: false,
          },
        },
        stroke: {
          curve: 'stepline',
        },
        xaxis: {
          type: 'datetime',
        },
      },
    }
  },
  async fetch() {
    Source.commit((state) => {
      state.fetching = true
    })
    await Source.api().get('/sources')
    Source.commit((state) => {
      state.fetching = false
    })
  },
  computed: {
    selectedMetricMetadata() {
      if (!this.hasSelectedMetric()) return {}

      const metric = this.matchingMetrics[0]

      const metadata = metric.additionalMetadata
      metadata.description = metric.description
      metadata.unit = metric.unit
      metadata.source = metric.source
      metadata.historic = metric.historic
      metadata.rate = metric.rate

      return metadata
    },
    selectedMetric() {
      return this.hasSelectedMetric() ? this.matchingMetrics[0] : undefined
    },
  },
  watch: {
    async selectedMetric() {
      if (this.hasSelectedMetric()) {
        this.$router.push({
          name: 'metric-metricId',
          params: { metricId: this.metric },
        })

        this.metricqWebsocket = await MetricQLive.connect('ws://localhost:3003')

        this.metricqWebsocket.onData = (metric, time, value) => {
          this.onMetricData(metric, time, value)
        }

        this.metricqWebsocket.subscribe(this.metric)

        this.metricLiveData = [{ name: this.metric, data: [] }]
      }
    },
  },
  methods: {
    onMetricSelect(metric) {
      this.metric = metric
    },
    onSearchClick() {
      this.$refs.metricInput.select()
    },
    isValidMetric() {
      if (this.hasSelectedMetric()) return true

      if (this.matchingMetrics.length > 0) return null

      return false
    },
    hasSelectedMetric() {
      return (
        this.matchingMetrics.length > 0 &&
        this.metric === this.matchingMetrics[0].id
      )
    },
    getMetricSource(sourceId) {
      return Source.query().whereId(sourceId).first()
    },
    onMetricData(metric, time, value) {
      if (this.hasSelectedMetric() && this.metric === metric) {
        const oldData = this.metricLiveData[0].data

        if (!isNaN(value)) {
          oldData.push({ x: time.valueOf(), y: value })
        } else {
          oldData.push({
            x: time.valueOf(),
            y: 0,
            marker: {
              size: 8,
            },
            label: {
              borderColor: '#FF4560',
              text: 'NaN',
            },
          })
        }
        if (oldData.length > 100) {
          this.metricLiveData = [{ name: this.metric, data: oldData.slice(1) }]
        } else {
          this.metricLiveData = [{ name: this.metric, data: oldData }]
        }
      }
    },
  },
}
</script>

<style scoped>
.metricLibrary {
  height: calc(100vh - 56px);
}

.autocomplete {
  position: relative;
}

.autocomplete-results {
  padding: 0;
  margin: 0;
  border: 1px solid #eeeeee;
  height: 100%;
  min-height: 1em;
}

.autocomplete-result {
  list-style: none;
  text-align: left;
  padding: 4px 2px;
  cursor: pointer;
}

.autocomplete-result:hover {
  background-color: #4aae9b;
  color: white;
}

.json-tree-root {
  background-color: white;
}
</style>
