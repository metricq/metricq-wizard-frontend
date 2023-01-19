<template>
  <b-card no-body :header="title">
    <b-list-group v-if="metrics.length" flush align="left">
      <b-list-group-item v-for="metric in metrics" :key="metric">
        <b-row>
          <b-col class="text-nowrap">
            {{ metric }}
          </b-col>
          <b-col align="right" class="float-right">
            <b-button
              v-b-tooltip.hover
              :to="{
                name: 'metric-metricId',
                params: { metricId: metric },
              }"
              variant="info"
              title="Metric Details"
              size="sm"
            >
              <b-icon-search scale="1.5" />
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
  </b-card>
</template>

<script>
export default {
  props: {
    metrics: { type: Array, default: () => [] },
    title: { type: String, default: () => 'Metrics' },
    emptyMessage: { type: String, default: () => 'No metrics.' },
  },
}
</script>
