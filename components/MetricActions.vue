<template>
  <span v-if="metric">
    <b-button-group size="sm" class="shadow-sm">
      <b-button
        v-if="isInStore"
        v-b-tooltip.hover.noninteractive
        title="Unload from Metric Workshop"
        variant="dark"
        @click="onUnloadMetricClick()"
      >
        <b-icon-bookmark-dash-fill scale="1.2" />
      </b-button>
      <b-button
        v-else
        v-b-tooltip.hover.noninteractive
        title="Load into Metric Workshop"
        variant="dark"
        @click="onLoadMetricClick()"
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
        v-if="showArchive && !archived"
        v-b-tooltip.hover.noninteractive
        variant="warning"
        title="Archive the metric"
        @click="archiveMetric(metric)"
      >
        <b-icon-archive scale="1.2" />
      </b-button>
      <b-button
        v-if="showDelete && metric.historic === undefined"
        v-b-tooltip.hover.noninteractive
        variant="danger"
        title="Delete the metric"
        @click="deleteMetric(metric)"
      >
        <b-icon-trash scale="1.2" />
      </b-button>
    </b-button-group>
    <b-button-group size="sm" class="shadow-sm">
      <b-button
        v-b-tooltip.hover.noninteractive
        size="sm"
        variant="outline-info"
        title="Open in WebView"
        :href="webviewLink()"
        target="_blank"
      >
        <b-icon-graph-up />
      </b-button>
    </b-button-group>
    <b-button-group v-if="showState && archived" size="sm" class="shadow-sm">
      <span id="archive-tooltip-target">
        <b-button size="sm" variant="secondary" disabled>
          <b-icon-archive-fill scale="1.2" />
        </b-button>
      </span>
      <b-tooltip target="archive-tooltip-target" noninteractive>
        Archived {{ archived | momentAgo }}: {{ archived }}
      </b-tooltip>
    </b-button-group>
    <b-button-group v-if="showState && isLiveOnly" size="sm" class="shadow-sm">
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
import moment from 'moment'
import Metric from '~/models/Metric'

export default {
  props: {
    metric: { type: Object, required: true },
    showDetails: { type: Boolean, default: true },
    showDelete: { type: Boolean, default: true },
    showArchive: { type: Boolean, default: true },
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
      return this.metric.archived
    },
    isLiveOnly() {
      return this.metric.historic === false
    },
  },
  methods: {
    async onLoadMetricClick() {
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
    onUnloadMetricClick() {
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
        okTitle: 'Yes, archive',
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

          this.$toast.success(`Successfully archived ${this.metric.id}!`)

          // we update the metric with a slightly wrong time point for
          // archived, but it doesn't really matter. The user just clicked
          // the button, so he knows it was archived just a jiffy ago.
          // We'll fetch the actual time point sooner or later anyways.
          Metric.update({
            where: this.metric.id,
            data: {
              archived: moment().toISOString(),
            },
          })

          this.$emit('archived', moment().toISOString())
        } catch (error) {
          this.$toast.error(`Failed to archive the metric!`)
        }
      }
    },
    webviewLink() {
      return this.$webview.link([this.metric.id])
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
