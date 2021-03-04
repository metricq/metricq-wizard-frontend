<template>
  <div>
    <b-row>
      <b-col>
        <b-table
          ref="metricListTable"
          v-model="currentTableItems"
          :items="items"
          :fields="fields"
          :per-page="pageSize"
          :current-page="currentPage"
          :empty-text="emptyText"
          small
          primary-key="id"
          responsive="true"
          select-mode="multi"
          sort-icon-left
          striped
          hover
          show-empty
          @row-clicked="onRowClicked"
        >
          <template #cell(select)="data">
            <b-checkbox
              :checked="data.item.selected"
              @change="onRowSelected(data.item, $event)"
            />
          </template>
          <template #cell(source)="data">
            <b-link
              v-if="data.item.sourceRef && data.item.sourceRef.configurable"
              :to="{
                name: 'source-config_item_list-sourceId',
                params: { sourceId: data.item.source },
              }"
            >
              {{ data.item.source }}
            </b-link>
            <b-link
              v-else
              :to="{
                name: 'source-edit_json-sourceId',
                params: { sourceId: data.item.source },
              }"
            >
              {{ data.item.source }}
            </b-link>
          </template>
          <template #cell(lastMetadataUpdate)="data">
            {{
              data.item.lastMetadataUpdate
                ? data.item.lastMetadataUpdate.toLocaleString()
                : ''
            }}
          </template>
          <template #cell(state)="data">
            <b-badge v-if="data.item.historic"> Saved in DB </b-badge>
          </template>
          <template #cell(actions)="row">
            <b-button size="sm" class="mr-2" @click="row.toggleDetails">
              {{ row.detailsShowing ? 'Hide' : 'Show' }} Metadata
            </b-button>
            <b-button
              v-if="row.item.sourceRef.isCombinator"
              size="sm"
              @click="editCombinedMetric(row.item)"
            >
              Edit expression
            </b-button>
          </template>

          <template #row-details="row">
            <!--              v-model="row.item.additionalMetadata"-->
            <pre>{{
              JSON.stringify(row.item.additionalMetadata, null, 2)
            }}</pre>
          </template>
        </b-table>
        <b-pagination
          v-model="currentPage"
          :total-rows="rows"
          :per-page="pageSize"
          align="center"
          first-number
          last-number
        />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Metric from '~/models/Metric'

export default {
  name: 'MetricTable',
  props: {
    filter: { type: String, default: null },
    historic: { type: Boolean, default: null },
    pageSize: { type: Number, default: 20 },
    disableFuzzy: { type: Boolean, default: false },
    unit: { type: String, default: null },
    rate: { type: Number, default: null },
  },
  data() {
    return {
      currentTableItems: [],
      currentPage: 1,
      fields: [
        {
          key: 'select',
          sortable: true,
          sortByFormatted: (value, key, item) => {
            return item.selected ? '0Yes' : '1No' // sort selected, than no selected for ascending sorting
          },
        },
        { key: 'id', sortable: true },
        { key: 'rate', sortable: true },
        { key: 'description', sortable: true },
        { key: 'unit', sortable: true },
        { key: 'source', sortable: true },
        { key: 'lastMetadataUpdate', sortable: true },
        { key: 'state', sortable: true },
        { key: 'actions', sortable: false },
      ],
    }
  },
  computed: {
    rows() {
      return this.items.length
    },
    items() {
      let metricQuery = Metric.query().with('sourceRef')
      if (this.historic != null) {
        metricQuery = metricQuery.where('historic', this.historic)
      }
      if (this.unit != null) {
        metricQuery = metricQuery.where('unit', this.unit)
      }
      if (this.rate != null) {
        metricQuery = metricQuery.where('rate', this.rate)
      }
      if (this.filter) {
        if (this.disableFuzzy) {
          metricQuery = metricQuery.where(
            (metric) =>
              metric.id.includes(this.filter) ||
              metric.source.includes(this.filter)
          )
        } else {
          metricQuery = metricQuery.search(this.filter, {
            keys: ['id', 'source', 'description', 'units'],
            threshold: 0.3,
          })
        }
      }
      return metricQuery.get()
    },
    selected() {
      return Metric.query().where('selected', true).get()
    },
    emptyText() {
      if (this.historic == null && !this.filter) {
        return 'No metrics loaded! Please use the controlls at the top.'
      }
      return 'There are no metrics matching your filter.'
    },
  },
  methods: {
    onRowSelected(item, state) {
      Metric.update({
        where: item.id,
        data: { selected: state },
      })
    },
    onRowClicked(item, index, event) {
      Metric.update({
        where: item.id,
        data: { selected: !item.selected },
      })
    },
    selectCurrentPage() {
      this.currentTableItems.forEach((item) => {
        item.selected = true
        item.$save()
      })
    },
    selectAllFiltered() {
      this.items.forEach((item) => {
        item.selected = true
        item.$save()
      })
    },
    deselectCurrentPage() {
      this.currentTableItems.forEach((item) => {
        item.selected = false
        item.$save()
      })
    },
    deselectAllFiltered() {
      this.items.forEach((item) => {
        item.selected = false
        item.$save()
      })
    },
    deselectAll() {
      this.selected.forEach((item) => {
        item.selected = false
        item.$save()
      })
    },
    async editCombinedMetric(item) {
      try {
        const { status, data } = await this.$axios.get(
          `/transformer/${item.source}/${item.id}`
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
  },
}
</script>

<style scoped>
pre {
  white-space: pre-wrap; /* Since CSS 2.1 */
  white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
  white-space: -pre-wrap; /* Opera 4-6 */
  white-space: -o-pre-wrap; /* Opera 7 */
  word-wrap: break-word; /* Internet Explorer 5.5+ */
}
</style>
