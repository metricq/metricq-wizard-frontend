<template>
  <div>
    <b-row>
      <b-col>
        <b-table
          ref="metricListTable"
          v-model="currentTableItems"
          :items="items"
          :fields="fields"
          :per-page="perPage"
          :current-page="currentPage"
          @row-clicked="onRowClicked"
          primary-key="id"
          responsive="true"
          select-mode="multi"
          striped
          hover
        >
          <template v-slot:cell(select)="data">
            <b-checkbox
              :checked="data.item.selected"
              @change="onRowSelected(data.item, $event)"
            />
          </template>
          <template v-slot:cell(state)="data">
            <b-badge v-if="data.item.historic">
              Saved in DB
            </b-badge>
          </template>
        </b-table>
        <b-pagination
          v-model="currentPage"
          :total-rows="rows"
          :per-page="perPage"
          align="center"
        />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Metric from '~/models/Metric'

export default {
  name: 'MetricTable',
  props: ['filter', 'historic'],
  data() {
    return {
      currentTableItems: [],
      perPage: 10,
      currentPage: 1,
      fields: [
        {
          key: 'select',
          sortable: true,
          sortByFormatted: (value, key, item) => {
            return item.selected ? '0Yes' : '1No' // sort selected, than no selected for ascending sorting
          }
        },
        { key: 'id', sortable: true },
        { key: 'rate', sortable: true },
        { key: 'description', sortable: true },
        { key: 'unit', sortable: true },
        { key: 'source', sortable: true },
        { key: 'state', sortable: true }
      ]
    }
  },
  computed: {
    rows() {
      return this.items.length
    },
    items() {
      let metricQuery = Metric.query()
      if (this.historic != null) {
        metricQuery = metricQuery.where('historic', this.historic)
      }
      if (this.filter) {
        metricQuery = metricQuery.search(this.filter, {
          keys: ['id', 'source', 'description']
        })
      }
      return metricQuery.get()
    },
    selected() {
      return Metric.query()
        .where('selected', true)
        .get()
    }
  },
  methods: {
    onRowSelected(item, state) {
      Metric.update({
        where: item.id,
        data: { selected: state }
      })
    },
    onRowClicked(item, index, event) {
      Metric.update({
        where: item.id,
        data: { selected: !item.selected }
      })
    }
  }
}
</script>

<style scoped />
