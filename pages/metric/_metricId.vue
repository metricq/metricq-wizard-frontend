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
                :trim="true"
                :state="metricValidationState()"
                :autofocus="true"
                @click="onSearchClick()"
              />
              <b-input-group-append>
                <b-button :disabled="!metric" @click="metric = ''">
                  Clear
                </b-button>
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
              {{ match.id }}
              <template v-if="match.description">
                - {{ match.description }}
              </template>
            </li>
          </ul>

          <b-card-body
            v-if="hasSelectedMetric()"
            align="center"
            class="d-flex flex-column"
          >
            <b-card-group deck>
              <b-card no-body class="h-100">
                <b-card-header>
                  Details
                  <MetricActions
                    v-if="selectedMetric"
                    :metric="selectedMetric"
                    :show-details="false"
                    class="float-right"
                  />
                </b-card-header>
                <b-card-text>
                  <JsonTree :data="selectedMetricMetadata" />
                </b-card-text>
              </b-card>
              <b-card no-body header="Source">
                <b-list-group flush class="h-100">
                  <b-list-group-item>
                    <b-row>
                      <b-col align="left">
                        <span class="lead">
                          {{ selectedMetric.source }}
                        </span>
                      </b-col>
                      <b-col>
                        <client-actions
                          :client="getMetricSource(selectedMetric.source)"
                        />
                      </b-col>
                    </b-row>
                  </b-list-group-item>
                </b-list-group>
              </b-card>
              <b-card no-body header="Consumers">
                <b-list-group flush class="h-100">
                  <b-list-group-item
                    v-for="consumer in selectedMetricConsumers"
                    :key="consumer.id"
                    align="left"
                  >
                    <b-row>
                      <b-col align="left">
                        <span class="lead">
                          {{ consumer.id }}
                        </span>
                      </b-col>
                      <b-col>
                        <client-actions :client="consumer" />
                      </b-col>
                    </b-row>
                  </b-list-group-item>
                </b-list-group>
              </b-card>
            </b-card-group>

            <b-card no-body header="Live Data Points" class="mt-4 flex-grow-1">
              <b-card-body>
                <line-chart
                  :ytitle="selectedMetricMetadata.unit"
                  :data="metricLiveData"
                  :label="selectedMetric.id"
                  :messages="{ empty: 'No data received yet' }"
                  :curve="false"
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
import MetricActions from '~/components/MetricActions.vue'
import Metric from '~/models/Metric'
import Client from '~/models/Client'

const MAX_DATA_POINTS = 100

export default {
  components: { ClientActions, MetricActions },
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

        if (this.$fetchState.pending) return []

        const { data } = await this.$axios.get(
          `/metric/${this.metric}/consumers`
        )

        return Client.findIn(data)
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
    await Client.fetchAll()
  },
  computed: {
    selectedMetricMetadata() {
      if (!this.hasSelectedMetric()) return {}

      const metric = this.matchingMetrics[0]
      const { description, unit, source, historic, rate } = metric
      return {
        ...(description && { description }),
        ...(unit && { unit }),
        ...(source && { source }),
        ...(historic && { historic }),
        ...(rate && { rate }),
        ...metric.additionalMetadata,
      }
    },
    selectedMetric() {
      if (!this.hasSelectedMetric()) return null

      return this.matchingMetrics[0]
    },
  },
  watch: {
    async selectedMetric() {
      if (this.hasSelectedMetric()) {
        this.$router.push({
          name: 'metric-metricId',
          params: { metricId: this.metric },
        })

        this.metricqWebsocket = await MetricQLive.connect(
          this.$config.metricq.websocketURL
        )

        this.metricqWebsocket.onData = this.onMetricData

        this.metricqWebsocket.subscribe(this.metric)

        this.metricLiveData = []
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
    metricValidationState() {
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
      // A transformer can be the source of a metric, but isn't a Source in our model.
      // Hence we use Client to query here, instead.
      return Client.query().whereId(sourceId).first()
    },
    onMetricData(metric, time, value) {
      if (this.hasSelectedMetric() && this.metric === metric) {
        const oldData = this.metricLiveData

        // value can never be non-finite, the sink-websocket filters that.
        // I'd love to notify users, that there are NaN values, but that
        // needs to wait.
        oldData.push([time.toDate(), value])

        if (oldData.length > MAX_DATA_POINTS) {
          this.metricLiveData = oldData.slice(1)
        } else {
          this.metricLiveData = oldData
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
