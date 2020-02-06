<template>
  <div class="pl-2 pr-2">
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
          <template v-slot:cell(id)="data">
            <span v-if="data.item.configurable">{{ data.item.id }}</span>
            <del v-else>{{ data.item.id }}</del>
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
      tableFields: [{ key: 'id', label: 'Source' }, 'actions']
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
