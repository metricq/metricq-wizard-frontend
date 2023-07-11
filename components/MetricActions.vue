<template>
  <span v-if="metric">
    <b-button-group size="sm" class="shadow-sm">
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
        v-if="!archived"
        v-b-tooltip.hover.noninteractive
        variant="warning"
        title="Archive the metric"
        @click="archiveMetric(metric)"
      >
        <b-icon-archive scale="1.2" />
      </b-button>
      <b-button
        v-if="showDelete && !metric.historic"
        v-b-tooltip.hover.noninteractive
        variant="danger"
        title="Delete the metric"
        @click="deleteMetric(metric)"
      >
        <b-icon-trash scale="1.2" />
      </b-button>
    </b-button-group>
    <b-button-group v-if="showState && archived" size="sm" class="shadow-sm">
      <span id="archive-tooltip-target">
        <b-button size="sm" variant="secondary" disabled>
          <b-icon-archive-fill scale="1.2" />
        </b-button>
      </span>
      <b-tooltip target="archive-tooltip-target" noninteractive>
        Archived {{ archived | momentAgo }}
      </b-tooltip>
    </b-button-group>
    <b-button-group v-if="showState && liveOnly" size="sm" class="shadow-sm">
      <span id="live-only-tooltip-target">
        <b-button size="sm" variant="secondary" disabled>
          <b-icon-cloud-slash-fill scale="1.2" />
        </b-button>
      </span>
      <b-tooltip target="live-only-tooltip-target" noninteractive>
        Live Only
      </b-tooltip>
    </b-button-group>
  </span>
  <b-icon-exclamation-diamond
    v-else
    v-b-tooltip.hover.noninteractive
    variant="danger"
    title="Fuzzy cats. Something went wrong. Cannot show metric actions."
  />
</template>

<script>
import Metric from '~/models/Metric'

export default {
  props: {
    metric: { type: Object, required: true },
    showDetails: { type: Boolean, default: true },
    showDelete: { type: Boolean, default: true },
    showState: { type: Boolean, default: false },
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
    archived() {
      if (this.metric.archived !== undefined) return this.metric.archived
      return this.metric.additionalMetadata !== undefined
        ? this.metric.additionalMetadata.archived
        : undefined
    },
    liveOnly() {
      return this.metric.historic === false
    },
  },
  methods: {
    async loadMetric() {
      await Metric.api().post(
        '/metrics',
        {
          requested_metrics: [this.metric.id],
        },
        {
          dataTransformer: Metric.convertMetricListResponse,
        }
      )
    },
    unloadMetric() {
      Metric.delete(this.metric.id)
    },
    async editCombinedMetric({ source, id }) {
      try {
        const { data } = await this.$axios.get(`/transformer/${source}/${id}`)

        await this.$router.push({
          name: 'metric-create_combined_metric',
          params: {
            expression: data.expression,
            combinator: data.transformerId,
            metric: data.metric,
            configHash: data.configHash,
          },
        })
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
        try {
          await Metric.deleteMetadata([this.metric.id])

          this.$toast.success(`Successfully deleted ${this.metric.id}!`)

          // remove the metric from the vuex store
          Metric.delete(this.metric.id)

          // go back to where the user came from. I hope that is still a valid.
          this.$router.go(-1)
        } catch (error) {
          this.$toast.error(`Failed to delete the metric!`)
        }
      }
    },
    async archiveMetric() {
      const confirmed = await this.$bvModal.msgBoxConfirm(this.metric.id, {
        titleHtml: `Are you sure you want to archive the metric?`,
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'Yes, delete',
        cancelTitle: 'No, cancel',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      })

      if (confirmed) {
        try {
          await this.$axios.post(`/metrics/archive`, {
            metrics: [this.metric.id],
          })

          this.$toast.success(`Successfully deleted ${this.metric.id}!`)

          // remove the metric from the vuex store
          Metric.delete(this.metric.id)
        } catch (error) {
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
