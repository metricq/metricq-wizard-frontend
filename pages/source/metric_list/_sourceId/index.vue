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
          :to="{
            name: 'source-source_list'
          }"
          class="mb-1"
        >
          Back to source overview
        </b-button>
      </b-col>
      <b-col cols="4">
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
        <b-button
          class="mb-1 mr-1 float-right"
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
    </b-row>
    <b-table
      ref="metricListTable"
      :items="configurationItems"
      :fields="tableFields"
      small
      primary-key="id"
      responsive="true"
      striped
      hover
    >
      <template v-slot:cell(actions)="data">
        <b-button
          :to="{
            name: 'source-metric_list-sourceId-configItemId',
            params: {
              sourceId: id,
              configItemId: data.item.id
            }
          }"
          size="sm"
        >
          Configure metrics
        </b-button>
        <b-button
          :to="{
            name: 'source-metric_list-sourceId-configItemId-edit',
            params: {
              sourceId: id,
              configItemId: data.item.id
            }
          }"
          size="sm"
        >
          Edit
        </b-button>
        <b-button
          @click="deleteConfigItem(data.item)"
          variant="danger"
          size="sm"
        >
          Delete
        </b-button>
        <b-badge v-if="data.item.historic">
          Saved in DB
        </b-badge>
      </template>
    </b-table>
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
      configurationItems: data,
      tableFields: ['name', 'description', 'actions']
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
