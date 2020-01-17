<template>
  <div class="p-2">
    <b-row>
      <b-col>
        <h1>{{ id }}</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-button
          class="mb-1"
          :to="{
            name: 'source-metric_list-sourceId-edit_global_configuration',
            params: {
              sourceId: id
            }
          }"
        >
          Edit global source configuration
        </b-button>
      </b-col>
      <b-col cols="2">
        <b-button
          :to="{
            name: 'source-metric_list-sourceId-add_configuration_item',
            params: {
              sourceId: id
            }
          }"
          class="mb-1 float-right"
        >
          Add new configuration item
        </b-button>
      </b-col>
    </b-row>
    <b-list-group>
      <b-list-group-item
        v-for="configItem in configurationItems"
        :key="configItem.id"
        :to="{
          name: 'source-metric_list-sourceId-configItemId',
          params: {
            sourceId: id,
            configItemId: configItem.id
          }
        }"
      >
        <h4>
          {{ configItem.name }}
          <small class="text-muted">{{ configItem.description }}</small>
          <b-link
            :to="{
              name: 'source-metric_list-sourceId-configItemId-edit',
              params: {
                sourceId: id,
                configItemId: configItem.id
              }
            }"
          >
            Edit
          </b-link>
        </h4>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import Source from '~/models/Source'

export default {
  components: {},
  async asyncData({ $axios, params }) {
    const { data } = await $axios.get(`/source/${params.sourceId}/config_items`)
    return {
      id: params.sourceId,
      configurationItems: data
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
