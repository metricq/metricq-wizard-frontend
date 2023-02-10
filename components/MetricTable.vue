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
          class="mb-0"
          @row-clicked="onRowClicked"
        >
          <template #cell(select)="data">
            <b-checkbox
              :checked="data.item.selected"
              @change="onRowSelected(data.item, $event)"
            />
          </template>
          <template #cell(id)="data">
            <b-link
              :to="{
                name: 'metric-metricId',
                params: { metricId: data.item.id },
              }"
            >
              {{ data.item.id }}
            </b-link>
          </template>
          <template #cell(source)="data">
            <b-link
              :to="{
                name: 'client-clientId',
                params: { clientId: data.item.source },
              }"
            >
              {{ data.item.source }}
            </b-link>
          </template>
          <template #cell(rate)="data">
            {{ data.item.rate | humanizeRate }}
          </template>
          <template #cell(lastMetadataUpdate)="data">
            {{
              data.item.lastMetadataUpdate
                ? data.item.lastMetadataUpdate.toLocaleString()
                : ''
            }}
          </template>
          <template #cell(state)="data">
            <b-badge
              v-if="data.item.sourceRef && data.item.sourceRef.isCombinator"
            >
              <b-icon-calculator v-b-tooltip.hover title="Combined Metric" />
            </b-badge>
            <b-badge v-if="data.item.historic">
              <b-icon-server v-b-tooltip.hover title="Saved in DB" />
            </b-badge>
          </template>
          <template #cell(actions)="data">
            <b-button
              size="sm"
              class="mr-2"
              variant="info"
              @click="data.toggleDetails"
            >
              <b-icon-clipboard-data /> Metadata
            </b-button>
            <b-button
              v-if="data.item.sourceRef && data.item.sourceRef.isCombinator"
              size="sm"
              @click="editCombinedMetric(data.item)"
            >
              <b-icon-pencil-square />
              Expression
            </b-button>
          </template>

          <template #row-details="data">
            <!--              v-model="row.item.additionalMetadata"-->
            <pre>{{
              JSON.stringify(data.item.additionalMetadata, null, 2)
            }}</pre>
          </template>
        </b-table>
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
    currentPage: { type: Number, default: 1 },
  },
  emits: ['filtered'],
  data() {
    return {
      currentTableItems: [],
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

      // I want to be compatible with the signature of the Table::filtered
      // event, but we don't use the actual items in the handler, so for
      // now, we emit null instead of metricQuery.get(). I don't want to
      // think about the performance implications of calling that magic
      // twice.
      this.$emit('filtered', null, metricQuery.count())

      return metricQuery.get()
    },
    selected() {
      return Metric.query().where('selected', true).get()
    },
    emptyText() {
      if (this.historic == null && !this.filter) {
        return 'No metrics loaded! Please use the controls at the top.'
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
