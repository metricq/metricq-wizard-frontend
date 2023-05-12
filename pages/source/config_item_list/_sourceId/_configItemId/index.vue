<template>
  <div>
    <b-row>
      <b-col>
        <h1>
          Source {{ id }} 🔧
          <span class="lead">Available Metrics for {{ configItem }}</span>
        </h1>
      </b-col>
      <SessionManager :source-id="id" />
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
          Update metrics configuration
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import FormGenerator from '~/components/forms/FormGenerator'
import SessionManager from '~/components/SessionManager'
import Source from '~/models/Source'

export default {
  components: { FormGenerator, SessionManager },
  async asyncData({ $axios, params, store }) {
    const { data } = await $axios.get(
      `/source/${params.sourceId}/config_item/${encodeURIComponent(
        params.configItemId
      )}/metrics`,
      {
        params: {
          session: store.state.session.sessionKey,
        },
      }
    )
    return {
      id: params.sourceId,
      configItem: params.configItemId,
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
      const { status } = await this.$axios.post(
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
        this.$router.back()
      }
    },
  },
}
</script>

<style scoped />
