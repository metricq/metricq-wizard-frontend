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
          <b-link
            @click="deleteConfigItem(configItem)"
            class="text-danger float-right"
            >Delete</b-link
          >
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
  methods: {
    async deleteConfigItem(configItem) {
      const answer = await this.$bvModal.msgBoxConfirm(
        `Should ${configItem.name} really be deleted?`,
        {
          title: 'Please Confirm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'YES',
          cancelTitle: 'NO',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true
        }
      )
      if (answer) {
        const { status } = await this.$axios.delete(
          `/source/${this.id}/config_item/${encodeURIComponent(configItem.id)}`
        )
        if (status === 200) {
          this.$toast.success('Deleted configuration item!')
          const { data } = await this.$axios.get(
            `/source/${this.id}/config_items`
          )
          this.configurationItems = data
        } else {
          this.$toast.error('Deleting configuration item failed!')
        }
      } else {
        console.log('Do not delete config item')
      }
    }
  }
}
</script>

<style scoped />
