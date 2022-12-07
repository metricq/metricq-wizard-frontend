<template>
  <div>
    <b-row>
      <b-col>
        <h1>Source Overview</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-table
          ref="metricListTable"
          :items="sources"
          :fields="tableFields"
          small
          primary-key="id"
          responsive="true"
          sort-icon-left
          striped
        >
          <template #head(actions)="data">
            <span class="float-right">{{ data.label }}</span>
          </template>
          <template #cell(actions)="data">
            <source-actions v-bind:source="data.item" />
          </template>
        </b-table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import SourceActions from '~/components/source_actions.vue'
import Source from '~/models/Source'

export default {
  components: { SourceActions },
  layout: 'nonfluid',
  data() {
    return {
      tableFields: [{ key: 'id', label: 'Source' }, 'type', 'actions'],
    }
  },
  async fetch() {
    Source.commit((state) => {
      state.fetching = true
    })
    await Source.api().get('/sources')
    Source.commit((state) => {
      state.fetching = false
    })
  },
  computed: {
    sources() {
      return Source.query().all()
    },
  },
  methods: {},
}
</script>

<style scoped />
