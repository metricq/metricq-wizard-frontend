<template>
  <div class="p-2">
    <b-row>
      <b-col>
        <h1>{{ id }}</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="2">
        <b-button
          :to="{
            name: 'source-metric_list-sourceId',
            params: {
              sourceId: id
            }
          }"
          class="mb-1"
        >
          Back to configuration item list
        </b-button>
      </b-col>
      <b-col cols="2" offset="8" align="right">
        <b-button :disabled="!isMetricSelected" @click="createSelectedMetrics">
          Configure metrics
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-table
          ref="availableMetricListTable"
          :items="availableMetrics"
          :fields="fields"
          small
          primary-key="id"
          responsive="true"
          striped
          hover
          @row-clicked="onRowClicked"
        >
          <template v-slot:cell(select)="data">
            <b-checkbox v-model="data.item.selected" />
          </template>
          <template v-slot:cell(metric_name)="data">
            <b-form inline>
              <span>{{ data.item.metric_prefix }}</span>
              <b-input
                v-if="data.item.has_custom_part"
                v-model="data.item.metric_custom_part"
                size="sm"
                type="text"
                trim
              />
              <span>{{ data.item.metric_suffix }}</span>
            </b-form>
          </template>
        </b-table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Metric from '~/models/Metric'

export default {
  components: {},
  async asyncData({ $axios, params }) {
    const { data } = await $axios.get(
      `/source/${params.sourceId}/config_item/${encodeURIComponent(
        params.configItemId
      )}/metrics`
    )
    return {
      id: params.sourceId,
      availableMetrics: data.map((item) => {
        if (item.selected === undefined) {
          item.selected = item.is_active
        }
        return item
      }),
      fields: ['select', 'id', 'current_value', 'metric_name']
    }
  },
  computed: {
    isMetricSelected() {
      return this.availableMetrics.reduce(function(accumulator, currentValue) {
        return accumulator || currentValue.selected
      }, false)
    },
    selectedMetrics() {
      return this.availableMetrics.filter((el) => el.selected)
    }
  },
  methods: {
    onRowClicked(item, index, event) {
      item.selected = !item.selected
    },
    async createSelectedMetrics() {
      const { status, data } = await this.$axios.post(
        `/source/${
          this.$route.params.sourceId
        }/config_item/${encodeURIComponent(
          this.$route.params.configItemId
        )}/metrics`,
        {
          metrics: this.selectedMetrics
        }
      )
      if (status === 200) {
        const answer = await this.$bvModal.msgBoxConfirm(
          `Save configuration for source ${this.id} and reconfigure source?`,
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
            `/source/${this.$route.params.sourceId}/save_reconfigure`
          )
          if (status === 200) {
            this.$toast.success(
              'Saved configuration and requested source reconfiguration!'
            )
            if (data.metrics.length !== 0) {
              const answer = await this.$bvModal.msgBoxConfirm(
                `${data.metrics.length} metrics created. Configure database storage for them?`,
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
                Metric.commit((state) => {
                  state.fetching = true
                })
                const loadingToast = this.$toast.info(
                  'Loading database configuration. Please wait!',
                  { duration: null }
                )
                // TODO find right method for getting metric subset
                await Metric.api().post('/metrics', {
                  requested_metrics: data.metrics
                })
                Metric.commit((state) => {
                  state.fetching = false
                })
                loadingToast.goAway()
                this.$toast.success('Loaded database configuration.')
                await this.$router.push({
                  name: 'metric-metric_list',
                  params: {
                    loadMetrics: false
                  }
                })
                return
              }
            }
          } else {
            this.$toast.error(
              'Saving configuration or source reconfiguration failed!'
            )
          }
        } else {
          console.log('Do not restart source')
        }
        this.$router.back()
      }
    }
  }
}
</script>

<style scoped />
