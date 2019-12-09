<template>
  <div>
    <b-row>
      <b-col cols="10" offset="1">
        <b-list-group>
          <b-list-group-item
            v-for="item in sources"
            v-bind:key="item.id"
            :to="{
              name: 'source-metric_list-sourceId',
              params: { sourceId: item.id }
            }"
          >
            {{ item.id }}
          </b-list-group-item>
        </b-list-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Source from '~/models/Source'

export default {
  asyncData() {
    return {}
  },
  computed: {
    sources() {
      return Source.query().all()
    }
  },
  fetch() {
    Source.commit((state) => {
      state.fetching = true
    })
    Source.api()
      .get('/sources')
      .finally(() => {
        Source.commit((state) => {
          state.fetching = false
        })
      })
  }
}
</script>

<style scoped />
