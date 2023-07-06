<template>
  <div>
    <b-row>
      <b-col>
        <h1>
          Cluster Health 🏥
          <span class="lead">Check for metric and configuration issues</span>
        </h1>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <loading-overlay ref="loadingOverlay" :duration="60" rounded="sm">
          <b-card no-body class="mb-3">
            <b-card-header>
              <b-row>
                <b-col>
                  <b-input-group size="sm" prepend="Filter">
                    <b-form-input
                      id="filter-input"
                      v-model="filter"
                      type="search"
                      debounce="200"
                      :autofocus="true"
                      placeholder="Type to Search"
                    />
                    <b-input-group-append>
                      <b-button
                        :disabled="!filter"
                        :variant="filter ? 'primary' : 'secondary'"
                        @click=";(filter = ''), (filterList = null)"
                      >
                        Clear
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-col>
                <b-col align="right">
                  <b-button variant="info" @click="clusterHealthScan">
                    <b-icon-arrow-repeat />
                    Re-scan Cluster for issues
                  </b-button>
                </b-col>
              </b-row>
            </b-card-header>

            <b-card-text>
              <b-table
                ref="issueTable"
                :items="issues"
                :fields="[
                  { key: 'severity', sortable: true },
                  { key: 'scope', sortable: true },
                  { key: 'issue', sortable: true },
                  { key: 'first_detection_date', sortable: true },
                  { key: 'date', sortable: true },
                  { key: 'actions' },
                ]"
                small
                :per-page="perPage"
                :current-page="currentPage"
                :filter="filter"
                :filter-function="filterFunction"
                primary-key="id"
                responsive="true"
                sort-by="id"
                sort-icon-left
                :sort-null-last="true"
                striped
                hover
                class="mb-0"
                show-empty
                @filtered="onFiltered"
              >
                <template #cell(scope)="data">
                  <b-link
                    v-if="data.item.scope_type === 'metric'"
                    :to="{
                      name: 'metric-metricId',
                      params: { metricId: data.item.scope },
                    }"
                  >
                    {{ data.item.scope }}
                  </b-link>
                </template>
                <template #head(first_detection_date)>First Detected</template>
                <template #cell(first_detection_date)="data">
                  {{ data.item.first_detection_date | momentAgo }}
                </template>
                <template #head(date)>Last Detected</template>
                <template #cell(date)="data">
                  {{ data.item.date | momentAgo }}
                </template>
                <template #cell(actions)="data">
                  <b-button-group size="sm">
                    <b-button
                      v-b-tooltip.hover.noninteractive
                      variant="success"
                      title="Mark as solved"
                      @click="onSolvedClick(data.item._id)"
                    >
                      <b-icon-check scale="1.3" />
                    </b-button>
                    <b-button
                      v-b-tooltip.hover.noninteractive
                      variant="warning"
                      title="Ignore for 24 hours"
                      @click="onIgnoreClick(data.item._id)"
                    >
                      <b-icon-skip-forward scale="1.3" />
                    </b-button>
                  </b-button-group>
                  <metric-actions
                    v-if="data.item.scope_type === 'metric'"
                    :metric="{
                      id: data.item.scope,
                      source: data.item.source,
                      historic: true,
                      archived: data.item.archived,
                    }"
                  />
                </template>
                <template #cell(severity)="data">
                  <template v-if="data.item.severity === 'warning'">
                    ⚠️ Warning
                  </template>
                  <template v-else-if="data.item.severity === 'error'">
                    🔥 Critical
                  </template>
                  <template v-else-if="data.item.severity === 'info'">
                    ℹ️ Info
                  </template>
                  <template v-else>
                    {{ data.item.label }}
                  </template>
                </template>
                <template #cell(issue)="data">
                  <template v-if="data.item.type === 'dead'">
                    Missing data points since
                    <span
                      v-b-tooltip.hover.noninteractive
                      :title="data.item.last_timestamp"
                    >
                      {{ data.item.last_timestamp | momentFromNow }}
                    </span>
                  </template>
                  <template v-else-if="data.item.type === 'timeout'">
                    Timed out during scan, check bindings
                  </template>
                  <template v-else-if="data.item.type === 'no_value'">
                    No value stored in any database
                  </template>
                  <template v-else-if="data.item.type === 'infinite'">
                    Found non-finite value(s) stored in the database
                  </template>
                  <template v-else-if="data.item.type === 'undead'">
                    Metric was archived
                    <span
                      v-b-tooltip.hover.noninteractive
                      :title="data.item.archived"
                    >
                      {{ data.item.archived | momentAgo }}
                    </span>
                    , but received new data points
                    <span
                      v-b-tooltip.hover.noninteractive
                      :title="data.item.last_timestamp"
                    >
                      {{ data.item.last_timestamp | momentAgo }}
                    </span>
                  </template>
                  <template v-else>
                    {{ data.item.type }}
                  </template>
                </template>
              </b-table>
            </b-card-text>

            <b-card-footer>
              <b-row align-v="center">
                <b-col>
                  <span>
                    Total issues: {{ issues.length }}
                    <template v-if="filter">
                      ({{ totalRows }} matching)
                    </template>
                  </span>
                </b-col>
                <b-col>
                  <b-pagination
                    v-if="issues.length > perPage"
                    v-model="currentPage"
                    :total-rows="totalRows"
                    :per-page="perPage"
                    first-number
                    last-number
                    class="justify-content-center"
                  />
                </b-col>
                <b-col class="text-right">
                  Issues per page
                  <b-form-select
                    v-model="perPage"
                    :options="[10, 20, 50, 100, 200, 500]"
                    size="sm"
                    class="w-25"
                  />
                </b-col>
              </b-row>
            </b-card-footer>
          </b-card>
        </loading-overlay>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import MetricActions from '~/components/MetricActions.vue'
import LoadingOverlay from '~/components/LoadingOverlay.vue'

export default {
  components: { MetricActions, LoadingOverlay },
  data() {
    return {
      filter: null,
      showReScanOverlay: false,
      perPage: 20,
      currentPage: 1,
      totalRows: 0,
      issues: [],
    }
  },
  async fetch() {
    const { data } = await this.$axios.get(`/cluster/issues`)
    this.issues = data
    this.totalRows = this.issues.length
  },
  methods: {
    onFiltered(_filteredItems, filteredItemsCount) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItemsCount
      this.currentPage = 1
    },
    async onSolvedClick(issue) {
      await this.$axios.delete(`/cluster/issues/${issue}`)
      this.issues = this.issues.filter((item) => item._id !== issue)
    },
    async clusterHealthScan() {
      this.showReScanOverlay = true
      await this.$axios.post(`/cluster/health_scan`)

      await this.$refs.loadingOverlay.showOverlay()

      this.$nuxt.refresh()
    },
    filterFunction(data, filter) {
      return data.scope.includes(filter) || data.type.includes(filter)
    },
  },
}
</script>

<style scoped />
