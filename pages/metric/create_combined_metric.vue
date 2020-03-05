<template>
  <div>
    <b-row>
      <b-col>
        <h1>Create combined metric</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-list-group class="w-100">
          <combined-metric-node :expression="testExpression" />
        </b-list-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import CombinedMetricNode from '~/components/CombinedMetricNode'
export default {
  layout: 'nonfluid',
  components: { CombinedMetricNode },
  data() {
    return {
      testExpression: {
        operation: 'sum',
        inputs: [
          'foo.bar.power',
          1.0,
          {
            operation: 'throttle',
            cooldown_period: '1s',
            input: 'foo.baz.highrate.power'
          },
          {
            operation: '*',
            left: 'foo.egg.voltage',
            right: {
              operation: '+',
              left: 'foo.egg.A.current',
              right: null
            }
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
</style>
