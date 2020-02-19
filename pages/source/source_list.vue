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
          <template v-slot:head(actions)="data">
            <span class="float-right">{{ data.label }}</span>
          </template>
          <template v-slot:cell(actions)="data">
            <b-button
              size="sm"
              class="float-right ml-1"
              variant="danger"
              @click="reconfigureSource(data.item.id)"
              v-b-tooltip.hover
              title="Send config to source"
            >
              <b-icon-bootstrap-reboot scale="1.5" />
            </b-button>
            <b-button
              :to="{
                name: 'source-config_item_list-sourceId',
                params: { sourceId: data.item.id }
              }"
              :disabled="!data.item.configurable"
              size="sm"
              class="float-right ml-1"
              v-b-tooltip.hover
              title="Edit source config"
            >
              <b-icon-gear scale="1.5" />
            </b-button>
            <b-button
              :to="{
                name: 'source-edit_json-sourceId',
                params: { sourceId: data.item.id }
              }"
              size="sm"
              class="float-right "
              v-b-tooltip.hover
              title="Edit raw JSON config"
            >
              <b-icon-document-code scale="1.5" />
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
  layout: 'nonfluid',
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
  },
  methods: {
    async reconfigureSource(sourceId) {
      const answer = await this.$bvModal.msgBoxConfirm(
        `Really reconfigure ${sourceId}?`,
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
        const { status } = await this.$axios.post(
          `/client/${sourceId}/reconfigure`
        )
        if (status === 200) {
          this.$toast.success('Requested source reconfiguration!')
        } else {
          this.$toast.error('Source reconfiguration failed!')
        }
      }
    }
  }
}
</script>

<style scoped />
