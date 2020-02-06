<template>
  <div class="pl-2 pr-2">
    <b-row>
      <b-col>
        <h1>Source Overview</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="lg-8" offset-lg="2">
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
          <template v-slot:head(actions)="data">
            <span class="float-right">{{ data.label }}</span>
          </template>
          <template v-slot:cell(actions)="data">
            <b-button
              :to="{
                name: 'source-config_item_list-sourceId',
                params: { sourceId: data.item.id }
              }"
              :disabled="!data.item.configurable"
              size="sm"
              class="float-right"
            >
              Configure source
            </b-button>
          </template>
        </b-table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Source from '~/models/Source'

export default {
  async fetch() {
    Source.commit((state) => {
      state.fetching = true
    })
    await Source.api().get('/sources')
    Source.commit((state) => {
      state.fetching = false
    })
  },
  data() {
    return {
      tableFields: [{ key: 'id', label: 'Source' }, 'type', 'actions']
    }
  },
  computed: {
    sources() {
      return Source.query().all()
    }
  }
}
</script>

<style scoped />
