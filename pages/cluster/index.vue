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
        <b-overlay :show="showReScanOverlay" rounded="sm">
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
                  { key: 'scope', sortable: true },
                  { key: 'type', sortable: true },
                  { key: 'date', sortable: true },
                  { key: 'severity', sortable: true },
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
                sort-null-last="true"
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
                <template #cell(actions)="data">
                  <metric-actions
                    v-if="data.item.scope_type === 'metric'"
                    :metric="{
                      id: data.item.scope,
                      source: data.item.source,
                      historic: true,
                    }"
                  />
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
                  Clients per page
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
        </b-overlay>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import MetricActions from '~/components/MetricActions.vue'

const SCAN_WAIT_TIME = 10

export default {
  components: { MetricActions },
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
    async clusterHealthScan() {
      this.showReScanOverlay = true
      await this.$axios.post(`/cluster/health_scan`)

      await this.$sleep(SCAN_WAIT_TIME)

      this.$nuxt.refresh()
      this.showReScanOverlay = false
    },
    filterFunction(data, filter) {
      return data.scope.includes(filter) || data.type.includes(filter)
    },
  },
}
</script>

<style scoped />
