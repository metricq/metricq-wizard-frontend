<template>
  <b-list-group-item class="flex-column align-items-start">
    <div>
      <b-link v-if="hasSubNodes" v-b-toggle="'subnodes-collapse-' + id">
        <span class="when-opened">
          <b-icon-triangle-fill flip-v />
        </span>
        <span class="when-closed">
          <b-icon-triangle-fill rotate="90" />
        </span>
      </b-link>
      <span v-if="type === 'empty'">
        <em class="text-muted">empty</em>
      </span>
      <span v-else-if="type === 'metric'">{{ expression }}</span>
      <span v-else-if="type === 'number'">{{ expression }}</span>
      <span v-else-if="type === 'throttle'">
        throttle ({{ expression.cooldown_period }})
      </span>
      <span v-else>{{ expression.operation }}</span>
      <span class="float-right mb-1">
        <b-button size="sm" variant="outline-secondary">
          <b-icon-pencil scale="1.5" />
        </b-button>
        <b-button v-if="deletable" variant="outline-danger" size="sm">
          <b-icon-trash scale="1.5" />
        </b-button>
      </span>
    </div>
    <b-collapse
      v-if="hasSubNodes"
      :id="'subnodes-collapse-' + id"
      class="w-100"
      :visible="!(type === 'throttle')"
    >
      <b-list-group class="w-100">
        <combined-metric-node
          v-for="input in inputs"
          :key="input"
          :expression="input"
          :deletable="type === 'multi'"
        />
      </b-list-group>
      <div class="w-100">
        <span class="float-right mt-1">
          <b-button v-if="canAddSubNodes" size="sm" variant="outline-secondary">
            <b-icon-plus scale="2" />
          </b-button>
        </span>
      </div>
    </b-collapse>
  </b-list-group-item>
</template>

<script>
export default {
  name: 'CombinedMetricNode',
  props: {
    expression: {
      type: Object,
      default() {
        return {}
      }
    },
    deletable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    let type
    let inputs
    if (!this.expression) {
      type = 'empty'
    } else if (
      this.expression instanceof String ||
      typeof this.expression === 'string'
    ) {
      type = 'metric'
    } else if (
      this.expression instanceof Number ||
      typeof this.expression === 'number'
    ) {
      type = 'number'
    } else if (['+', '-', '*', '/'].includes(this.expression.operation)) {
      type = 'binary'
      inputs = [this.expression.left, this.expression.right]
    } else if (['sum', 'min', 'max'].includes(this.expression.operation)) {
      type = 'multi'
      inputs = this.expression.inputs
    } else if (this.expression.operation === 'throttle') {
      type = 'throttle'
      inputs = [this.expression.input]
    }

    return {
      id: null,
      type,
      hasSubNodes: ['binary', 'multi', 'throttle'].includes(type),
      canAddSubNodes: type === 'multi',
      inputs
    }
  },
  mounted() {
    this.id = this._uid
  }
}
</script>

<style scoped>
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
</style>
