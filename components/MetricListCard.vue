<template>
  <b-card no-body>
    <b-card-header>
      <b-row>
        <b-col class="lead text-left align-middle">
          {{ title }}
        </b-col>
        <b-col>
          <b-input-group
            v-if="metrics.length > 0"
            size="sm"
            prepend="Filter"
            class="float-right"
          >
            <b-form-input
              v-model="filter"
              type="search"
              placeholder="Type to Search"
            ></b-form-input>

            <b-input-group-append>
              <b-button :disabled="!filter" @click="filter = ''">
                Clear
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>
    </b-card-header>
    <b-list-group v-if="metrics.length" flush>
      <b-list-group-item
        v-for="metric in metricsSlice"
        :key="metric"
        class="p-2"
      >
        <b-row>
          <b-col class="text-nowrap text-left">
            {{ metric }}
          </b-col>
          <b-col class="text-right float-right">
            <b-button
              v-b-tooltip.hover.noninteractive
              :to="{
                name: 'metric-metricId',
                params: { metricId: metric },
              }"
              variant="info"
              title="Metric Details"
              size="sm"
            >
              <b-icon-search scale="1.3" />
            </b-button>
          </b-col>
        </b-row>
      </b-list-group-item>
    </b-list-group>
    <b-list-group v-else flush>
      <b-list-group-item disabled>
        {{ emptyMessage }}
      </b-list-group-item>
    </b-list-group>
    <b-card-footer
      v-if="metrics.length > perPage"
      class="d-flex justify-content-center"
    >
      <b-pagination
        v-model="currentPage"
        :total-rows="filteredMetrics.length"
        :per-page="perPage"
      />
    </b-card-footer>
  </b-card>
</template>

<script>
export default {
  props: {
    metrics: { type: Array, default: () => [] },
    title: { type: String, default: () => 'Metrics' },
    emptyMessage: { type: String, default: () => 'No metrics.' },
  },
  data() {
    return {
      currentPage: 1,
      perPage: 10,
      filter: '',
    }
  },
  computed: {
    filteredMetrics() {
      return this.metrics.filter((metric) =>
        metric.match(new RegExp(this.filter, 'i'))
      )
    },
    metricsSlice() {
      return this.filteredMetrics.slice(
        (this.currentPage - 1) * this.perPage,
        this.currentPage * this.perPage
      )
    },
  },
}
</script>
