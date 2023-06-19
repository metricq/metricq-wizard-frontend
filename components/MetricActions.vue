<template>
  <b-button-group v-if="metric" size="sm" class="shadow-sm">
    <b-button
      v-if="isInStore"
      v-b-tooltip.hover.noninteractive
      title="Unload from Metric Workshop"
      variant="dark"
      @click="unloadMetric"
    >
      <b-icon-bookmark-dash-fill scale="1.2" />
    </b-button>
    <b-button
      v-else
      v-b-tooltip.hover.noninteractive
      title="Load into Metric Workshop"
      variant="dark"
      @click="loadMetric()"
    >
      <b-icon-bookmark-plus scale="1.2" />
    </b-button>
    <b-button
      v-if="showDetails"
      v-b-tooltip.hover.noninteractive
      :to="{
        name: 'metric-metricId',
        params: { metricId: metric.id },
      }"
      title="Open in Metric Library"
      variant="info"
    >
      <b-icon-search />
    </b-button>
    <b-button
      v-if="metric.source && sourceIsCombinator"
      v-b-tooltip.hover.noninteractive
      title="Edit Combinator Expression"
      @click="editCombinedMetric(metric)"
    >
      <b-icon-diagram3-fill />
    </b-button>
    <b-button
      v-if="metric.source"
      v-b-tooltip.hover.noninteractive
      title="Show Source Details"
      :to="{
        name: 'client-clientId',
        params: { clientId: metric.source },
      }"
      variant="info"
    >
      <b-icon-broadcast-pin scale="1.2" />
    </b-button>
    <b-button
      v-if="showDelete && !metric.historic"
      v-b-tooltip.hover.noninteractive
      variant="warning"
      title="Delete the metric"
      @click="deleteMetric(metric)"
    >
      <b-icon-trash scale="1.2" />
    </b-button>
  </b-button-group>
  <b-icon-exclamation-diamond v-else variant="danger" />
</template>

<script>
import Metric from '~/models/Metric'

export default {
  props: {
    metric: { type: Object, required: true },
    showDetails: { type: Boolean, default: true },
    showDelete: { type: Boolean, default: true },
  },
  computed: {
    sourceIsCombinator() {
      if (this.metric.source === null) return false

      // just a heuristic, we may want to rethink this when reworking the backend
      return (
        this.metric.source.startsWith('transformer-') &&
        this.metric.source.endsWith('-combinator')
      )
    },
    isInStore() {
      return Metric.query().where('id', this.metric.id).exists()
    },
  },
  methods: {
    loadMetric() {
      Metric.insert({ data: this.metric })
    },
    unloadMetric() {
      Metric.delete(this.metric.id)
    },
    async editCombinedMetric({ source, id }) {
      try {
        const { status, data } = await this.$axios.get(
          `/transformer/${source}/${id}`
        )
        if (status === 200) {
          await this.$router.push({
            name: 'metric-create_combined_metric',
            params: {
              expression: data.expression,
              combinator: data.transformerId,
              metric: data.metric,
              configHash: data.configHash,
            },
          })
        }
      } catch (error) {
        if (error.response.status === 404) {
          this.$toast.error(`Metric not found in combinator config!`)
        } else {
          this.$toast.error(`Getting metric expression failed!`)
        }
      }
    },
    async deleteMetric() {
      const confirmed = await this.$bvModal.msgBoxConfirm(this.metric.id, {
        titleHtml: `Are you sure you want to delete the metric?`,
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'Yes, delete',
        cancelTitle: 'No, cancel',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      })

      if (confirmed) {
        const response = await Metric.deleteMetadata([this.metric.id])

        if (response.status === 200) {
          this.$toast.success(`Successfully deleted ${this.metric.id}!`)

          // remove the metric from the vuex store
          Metric.delete(this.metric.id)

          // go back to where the user came from. I hope that is still a valid.
          this.$router.go(-1)
        } else {
          this.$toast.error(`Failed to delete the metric!`)
        }
      }
    },
  },
}
</script>

<style scoped>
/* Fix positions of tooltips. Known issue, see:
    https://github.com/bootstrap-vue/bootstrap-vue/issues/1732 */
.tooltip {
  top: 0;
}
</style>
