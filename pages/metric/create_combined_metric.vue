<template>
  <div>
    <b-row>
      <b-col>
        <h1>Create combined metric</h1>
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="6">
        <b-form-group
          label="Combinator"
          label-cols="4"
          label-align="left"
          label-for="selectCombinator"
          class="mb-0"
        >
          <b-form-select
            id="selectCombinator"
            v-model="combinator"
            :state="!!combinator"
            :options="combinators"
            :disabled="!combinatorChangeable"
            :value="null"
            required
            class="w-100"
          >
            <template #first>
              <b-form-select-option :value="null" disabled>
                Choose...
              </b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>
      <b-col />
    </b-row>
    <b-row class="mb-1">
      <b-col cols="6">
        <b-form-group
          label="Metric Name"
          label-cols="4"
          label-align="left"
          label-for="inputMetric"
          class="mb-0"
        >
          <b-form-input
            id="inputMetric"
            v-model="metric"
            :state="!!metric"
            :disabled="!combinatorChangeable"
            value=""
            required
            class="w-100"
          >
          </b-form-input>
        </b-form-group>
      </b-col>
      <b-col />
    </b-row>
    <b-row>
      <b-col>
        <h4>Metric expression</h4>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-list-group class="w-100">
          <combined-metric-node
            :expression="expression"
            @changeExpression="expression = $event"
          />
        </b-list-group>
      </b-col>
    </b-row>
    <b-row class="mt-2">
      <b-col>
        <b-button
          :to="{
            name: 'metric-metric_list',
          }"
          variant="danger"
        >
          Cancel
        </b-button>
      </b-col>
      <b-col />
      <b-col>
        <b-button
          variant="primary"
          :disabled="saving || !readyToSave"
          class="float-right"
          @click="saveAll"
        >
          <b-spinner v-if="saving" class="ml-auto" small />
          Save combined metric
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Transformer from '~/models/Transformer'
import CombinedMetricNode from '~/components/CombinedMetricNode'

export default {
  components: { CombinedMetricNode },
  layout: 'nonfluid',
  props: {},
  asyncData({ params }) {
    return {
      expression: params.expression || null,
      combinatorChangeable: params.expression == null,
      combinator: params.combinator || null,
      metric: params.metric || '',
      saving: false,
    }
  },
  computed: {
    readyToSave() {
      return !!this.combinator && !!this.expression && this.metric !== ''
    },
    combinators() {
      return Transformer.query()
        .all()
        .map((transformer) => transformer.id)
    },
  },
  methods: {
    saveAll() {
      console.log(this.expression)
      // TODO
    },
  },
}
</script>

<style scoped>
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
</style>
