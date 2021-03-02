<template>
  <div>
    <b-row>
      <b-col>
        <h1>Source {{ id }}: Available Metrics</h1>
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
          sort-icon-left
          hover
        >
          <template #cell(select)="data">
            <b-checkbox v-model="data.item.selected" />
          </template>
          <template #cell(id)="data">
            {{ data.value }}
          </template>
          <template #cell()="data">
            <FormGenerator
              v-model="data.item.customColumnsValues[data.field.key]"
              :schema="data.item.customColumns[data.field.key]"
              inline
              size="sm"
              hide-labels
              disable-actions
            />
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="2">
        <b-button
          :to="{
            name: 'source-config_item_list-sourceId',
            params: {
              sourceId: id,
            },
          }"
          variant="danger"
        >
          Cancel metric configuration
        </b-button>
      </b-col>
      <b-col>
        <b-button
          :disabled="!isMetricSelected"
          class="float-right"
          variant="primary"
          @click="createSelectedMetrics"
        >
          Configure metrics
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Metric from '~/models/Metric'
import FormGenerator from '~/components/forms/FormGenerator'
import Source from '~/models/Source'

export default {
  components: { FormGenerator },
  async asyncData({ $axios, params }) {
    const { data } = await $axios.get(
      `/source/${params.sourceId}/config_item/${encodeURIComponent(
        params.configItemId
      )}/metrics`,
      {
        params: {
          session: this.$store.state.session.sessionKey,
        },
      }
    )
    return {
      id: params.sourceId,
      availableMetrics: data.metrics.map((item) => {
        if (item.selected === undefined) {
          item.selected = item.isActive
        }
        if (!item.customColumnsValues) {
          item.customColumnsValues = {}
        }
        return item
      }),
      fields: [
        'select',
        'id',
        ...Object.entries(data.columns).map((item) => {
          return { key: item[0], label: item[1] }
        }),
      ],
    }
  },
  computed: {
    isMetricSelected() {
      return this.availableMetrics.reduce(function (accumulator, currentValue) {
        return accumulator || currentValue.selected
      }, false)
    },
    selectedMetrics() {
      return this.availableMetrics.filter((el) => el.selected)
    },
    source() {
      return Source.query().whereId(this.id).first() || new Source()
    },
  },
  methods: {
    async createSelectedMetrics() {
      const { status, data } = await this.$axios.post(
        `/source/${
          this.$route.params.sourceId
        }/config_item/${encodeURIComponent(
          this.$route.params.configItemId
        )}/metrics`,
        {
          metrics: this.selectedMetrics,
          notSelectedMetrics: this.availableMetrics
            .filter((el) => !el.selected)
            .map((item) => item.id),
        },
        {
          params: {
            session: this.$store.state.session.sessionKey,
          },
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
            centered: true,
          }
        )
        if (answer) {
          const { status } = await this.$axios.post(
            `/source/${this.$route.params.sourceId}/save_reconfigure`,
            {
              params: {
                session: this.$store.state.session.sessionKey,
              },
            }
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
                  centered: true,
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
                  requested_metrics: data.metrics,
                })
                Metric.commit((state) => {
                  state.fetching = false
                })
                loadingToast.goAway()
                this.$toast.success('Loaded database configuration.')
                await this.$router.push({
                  name: 'metric-metric_list',
                  params: {
                    loadMetrics: false,
                  },
                })
                return
              }
            }
          } else {
            this.$toast.error(
              'Saving configuration or source reconfiguration failed!'
            )
          }
        }
        this.$router.back()
      }
    },
  },
}
</script>

<style scoped />
