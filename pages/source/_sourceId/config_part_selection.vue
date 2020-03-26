<template>
  <div>
    <b-row>
      <b-col>
        <h1>
          Source {{ id }}:
          <span class="text-capitalize">{{ source.configItemName }}s</span>
        </h1>
      </b-col>
    </b-row>
    <b-card
      title="Parameters, only changing selected metrics"
      :sub-title="
        'This affects ' + settings.affectedMetricsMetrics + ' metrics.'
      "
      sub-title-text-variant="danger"
    >
      <b-card-text>
        <ul>
          <li v-for="item in settings.metrics" :key="item">{{ item }}</li>
        </ul>
      </b-card-text>
      <b-button class="card-link float-right">
        Change this configuration
      </b-button>
    </b-card>
    <b-card
      title="Parameters, changing selected metrics and some others of this source"
      :sub-title="
        'This affects ' + settings.affectedMetricsConfigItems + ' metrics.'
      "
      sub-title-text-variant="danger"
    >
      <b-card-text>
        <ul>
          <li v-for="item in settings.configItems" :key="item">{{ item }}</li>
        </ul>
      </b-card-text>
      <b-button
        class="card-link float-right"
        :to="{
          name: 'source-config_item_list-sourceId-edit_global_configuration',
          params: {
            sourceId: id
          }
        }"
      >
        Change this configuration
      </b-button>
    </b-card>
    <b-card
      title="Parameters, changing all metrics of this source"
      :sub-title="
        'This affects ' + settings.affectedMetricsGlobalConfig + ' metrics.'
      "
      sub-title-text-variant="danger"
    >
      <b-card-text>
        <ul>
          <li v-for="item in settings.globalConfig" :key="item">{{ item }}</li>
        </ul>
      </b-card-text>
      <b-button
        class="card-link float-right"
        :to="{
          name: 'source-config_item_list-sourceId-edit_global_configuration',
          params: {
            sourceId: id
          }
        }"
      >
        Change this configuration
      </b-button>
    </b-card>
  </div>
</template>

<script>
import Source from '~/models/Source'
import Metric from '~/models/Metric'

export default {
  components: {},
  layout: 'nonfluid',
  async asyncData({ $axios, params }) {
    await Source.api().get(`/source/${params.sourceId}`)
    const { data } = await $axios.post(
      `/source/${params.sourceId}/config_options`,
      {
        metrics: Metric.query()
          .where('selected', true)
          .get()
          .map((currentValue) => currentValue.id)
      }
    )
    console.log(data)
    return {
      id: params.sourceId,
      tableFields: ['name', 'description', 'actions'],
      settings: data || {}
    }
  },
  computed: {
    source() {
      return (
        Source.query()
          .whereId(this.id)
          .first() || new Source()
      )
    }
  },
  methods: {}
}
</script>

<style scoped />
