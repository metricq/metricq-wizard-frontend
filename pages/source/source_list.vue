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
            <b-button
              v-b-tooltip.hover
              size="sm"
              class="float-right ml-1"
              variant="danger"
              title="Send config to source"
              @click="reconfigureSource(data.item.id)"
            >
              <b-icon-bootstrap-reboot scale="1.5" />
            </b-button>
            <b-button
              v-b-tooltip.hover
              :to="{
                name: 'source-config_item_list-sourceId',
                params: { sourceId: data.item.id },
              }"
              :disabled="!data.item.configurable"
              size="sm"
              class="float-right ml-1"
              title="Edit source config"
            >
              <b-icon-gear scale="1.5" />
            </b-button>
            <b-button
              v-b-tooltip.hover
              :to="{
                name: 'source-edit_json-sourceId',
                params: { sourceId: data.item.id },
              }"
              size="sm"
              class="float-right"
              title="Edit raw JSON config"
            >
              <b-icon-file-code scale="1.5" />
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
          centered: true,
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
    },
  },
}
</script>

<style scoped />
