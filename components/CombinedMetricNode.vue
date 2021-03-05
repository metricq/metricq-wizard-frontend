<template>
  <b-list-group-item class="flex-column align-items-start">
    <div>
      <b-link
        v-if="hasSubNodes"
        v-b-toggle="'subnodes-collapse-' + id"
        class="no-underline"
      >
        <span class="when-opened">
          <b-icon-triangle-fill flip-v />
        </span>
        <span class="when-closed">
          <b-icon-triangle-fill rotate="90" />
        </span>
      </b-link>
      <span v-if="type === 'empty'">
        <em class="text-danger">Missing input!</em>
      </span>
      <span v-else-if="type === 'metric'">{{ expression }}</span>
      <span v-else-if="type === 'number'">{{ expression }}</span>
      <span v-else-if="type === 'throttle'">
        throttle ({{ expression.cooldown_period }})
      </span>
      <span v-else>{{ expression.operation }}</span>
      <span class="float-right mb-1">
        <b-button
          v-b-modal="'edit-modal-' + id"
          size="sm"
          variant="outline-secondary"
        >
          <b-icon-pencil scale="1.5" />
        </b-button>
        <b-button
          v-if="deletable"
          variant="outline-danger"
          size="sm"
          @click="$emit('deleteExpression')"
        >
          <b-icon-trash scale="1.5" />
        </b-button>
        <b-button
          v-if="outdentable"
          variant="outline-danger"
          size="sm"
          @click="$emit('outdentExpression')"
        >
          <b-icon-arrow90deg-left />
        </b-button>
        <b-button
          v-if="indentable"
          variant="outline-secondary"
          size="sm"
          @click="indentExpression"
        >
          <b-icon-arrow-return-right />
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
          v-for="(input, index) in inputs"
          :key="'cmn-' + index + '-' + getKeyFromExpression(input)"
          :expression="input"
          :deletable="type === 'multi'"
          :outdentable="type === 'throttle'"
          @changeExpression="updateSubexpression(index, $event)"
          @deleteExpression="deleteSubexpression(index)"
          @outdentExpression="outdentSubexpression"
        />
        <b-list-group-item
          class="flex-column align-items-start"
          v-if="inputs.length === 0"
        >
          <span class="text-danger">Missing inputs!</span>
        </b-list-group-item>
      </b-list-group>
      <div class="w-100">
        <span class="float-right mt-1">
          <b-button
            v-if="canAddSubNodes"
            size="sm"
            variant="outline-secondary"
            @click="addSubexpression"
          >
            <b-icon-plus scale="2" />
          </b-button>
        </span>
      </div>
    </b-collapse>

    <b-modal
      :id="'edit-modal-' + id"
      title="Edit node"
      size="lg"
      centered
      ok-title="Apply"
      @hide="resetEditValues"
      @ok="applyEditValuesFromOk"
    >
      <template #modal-header>
        <h4>Edit node</h4>
        <b-form-group
          label="Type:"
          :label-for="'edit-modal-header-type-select' + id"
          label-cols="2"
          class="float-right w-50 mb-0"
        >
          <b-select
            :id="'edit-modal-header-type-select' + id"
            v-model="editValues.type"
          >
            <b-select-option value="empty" disabled>empty</b-select-option>
            <b-select-option value="metric">Metric</b-select-option>
            <b-select-option value="number">Number</b-select-option>
            <b-select-option value="operation">
              Operation: +, -, *, /, sum, min, max
            </b-select-option>
            <b-select-option value="throttle">Throttle</b-select-option>
          </b-select>
        </b-form-group>
      </template>
      <form ref="editModalForm" @submit.stop.prevent="applyEditValues">
        <div v-if="editValues.type === 'metric'">
          <b-form-group
            label="Metric:"
            :label-for="'edit-modal-metric-input' + id"
            label-cols="3"
          >
            <b-form-input
              :id="'edit-modal-metric-input' + id"
              v-model="editValues.metric"
              :state="!!editValues.metric"
              list="metrics-list"
              required
            />
            <datalist id="metrics-list">
              <option v-for="metric in metrics" :key="metric.id">
                {{ metric.id }}
              </option>
            </datalist>
          </b-form-group>
        </div>
        <div v-else-if="editValues.type === 'number'">
          <b-form-group
            label="Number:"
            :label-for="'edit-modal-number-input' + id"
            label-cols="3"
          >
            <b-form-input
              :id="'edit-modal-number-input' + id"
              v-model="editValues.number"
              :state="!!editValues.number"
              type="number"
              required
            />
          </b-form-group>
        </div>
        <div v-else-if="editValues.type === 'operation'">
          <b-form-group
            label="Operation:"
            :label-for="'edit-modal-operation-select' + id"
            label-cols="3"
          >
            <b-select
              :id="'edit-modal-modal-operation-select' + id"
              v-model="editValues.operation"
              :state="!!editValues.operation"
              required
            >
              <b-form-select-option :value="null" disabled>
                Choose...
              </b-form-select-option>
              <b-select-option value="+">+ </b-select-option>
              <b-select-option value="-">-</b-select-option>
              <b-select-option value="*">*</b-select-option>
              <b-select-option value="/">/</b-select-option>
              <b-select-option value="sum">sum</b-select-option>
              <b-select-option value="min">min</b-select-option>
              <b-select-option value="max">max</b-select-option>
            </b-select>
          </b-form-group>
        </div>
        <div v-else-if="editValues.type === 'throttle'">
          <b-form-group
            label="Cooldown period:"
            :label-for="'edit-modal-throttle-input' + id"
            label-cols="3"
          >
            <b-form-input
              :id="'edit-modal-throttle-input' + id"
              v-model="editValues.cooldownPeriod"
              :state="!!editValues.cooldownPeriod"
              required
            />
          </b-form-group>
        </div>
      </form>
      <div v-if="willReduceInputs">
        <b class="text-danger">
          This will reduce the inputs count from {{ oldInputCount }} to
          {{ newInputCount }}!
        </b>
      </div>
    </b-modal>
  </b-list-group-item>
</template>

<script>
import Metric from '@/models/Metric'

export default {
  name: 'CombinedMetricNode',
  props: {
    expression: {
      type: [Object, String],
      default() {
        return {}
      },
    },
    deletable: {
      type: Boolean,
      default: false,
    },
    outdentable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const type = this.getExpressionType(this.expression)
    return {
      id: null,
      indentable: true,
      editValues: {
        type: type === 'binary' || type === 'multi' ? 'operation' : type,
        operation:
          type === 'binary' || type === 'multi'
            ? this.expression.operation
            : null,
        metric: type === 'metric' ? this.expression : null,
        number: type === 'number' ? this.expression : null,
        cooldownPeriod:
          type === 'throttle' ? this.expression.cooldown_period : null,
      },
    }
  },
  computed: {
    willReduceInputs() {
      if (this.type === this.editValues.type) {
        return false
      }
      if (this.editValues.type === 'empty') {
        return this.inputs.length !== 0
      }
      if (
        this.editValues.type === 'metric' ||
        this.editValues.type === 'number' ||
        this.editValues.type === 'throttle'
      ) {
        return (
          this.inputs.length > 1 &&
          !this.inputs.reduce((acc, curr) => acc && curr == null, true)
        )
      }
      if (['+', '-', '*', '/'].includes(this.editValues.operation)) {
        return this.inputs.length > 2
      }
      return false
    },
    type() {
      return this.getExpressionType(this.expression)
    },
    inputs() {
      return this.getInputsForExpression(this.expression)
    },
    metrics() {
      return Metric.query().get()
    },
    hasSubNodes() {
      return ['binary', 'multi', 'throttle'].includes(
        this.getExpressionType(this.expression)
      )
    },
    canAddSubNodes() {
      return this.getExpressionType(this.expression) === 'multi'
    },
    newInputCount() {
      if (this.editValues.type === 'empty') {
        return 0
      }
      if (
        this.editValues.type === 'metric' ||
        this.editValues.type === 'number' ||
        this.editValues.type === 'throttle'
      ) {
        return 1
      }
      if (['+', '-', '*', '/'].includes(this.editValues.operation)) {
        return 2
      }
      return this.inputs.length
    },
    oldInputCount() {
      return this.inputs.length
    },
  },
  watch: {},
  mounted() {
    this.id = this._uid
  },
  methods: {
    getKeyFromExpression(expression) {
      return btoa(JSON.stringify(expression))
    },
    getExpressionType(expression) {
      let type
      if (!expression) {
        type = 'empty'
      } else if (
        expression instanceof String ||
        typeof expression === 'string'
      ) {
        type = 'metric'
      } else if (
        expression instanceof Number ||
        typeof expression === 'number'
      ) {
        type = 'number'
      } else if (['+', '-', '*', '/'].includes(expression.operation)) {
        type = 'binary'
      } else if (['sum', 'min', 'max'].includes(expression.operation)) {
        type = 'multi'
      } else if (expression.operation === 'throttle') {
        type = 'throttle'
      }
      return type
    },
    getInputsForExpression(expression) {
      let inputs = []
      const type = this.getExpressionType(expression)

      if (type === 'binary') {
        inputs = [expression.left, expression.right]
      } else if (type === 'multi') {
        inputs = expression.inputs
      } else if (type === 'throttle') {
        inputs = [expression.input]
      }
      return inputs
    },
    resetEditValues(bvModalEvt) {
      if (bvModalEvt.trigger === 'ok') {
        return
      }

      this.editValues = {
        type:
          this.type === 'binary' || this.type === 'multi'
            ? 'operation'
            : this.type,
        operation:
          this.type === 'binary' || this.type === 'multi'
            ? this.expression.operation
            : null,
        metric: this.type === 'metric' ? this.expression : null,
        number: this.type === 'number' ? this.expression : null,
        cooldownPeriod:
          this.type === 'throttle' ? this.expression.cooldown_period : null,
      }
    },
    applyEditValuesFromOk(bvModalEvt) {
      bvModalEvt.preventDefault()

      this.applyEditValues()
    },
    checkFormValidity() {
      return this.$refs.editModalForm.checkValidity()
    },
    applyEditValues() {
      // Exit when the form isn't valid
      if (!this.checkFormValidity()) {
        return
      }

      let expression

      if (this.editValues.type === 'empty') {
        expression = null
      } else if (this.editValues.type === 'metric') {
        expression = this.editValues.metric
      } else if (this.editValues.type === 'number') {
        expression = this.editValues.number
      } else if (this.editValues.type === 'throttle') {
        expression = {
          operation: 'throttle',
          cooldown_period: this.editValues.cooldownPeriod,
          input: this.inputs[0] || null,
        }
      } else if (this.editValues.type === 'operation') {
        if (['+', '-', '*', '/'].includes(this.editValues.operation)) {
          expression = {
            operation: this.editValues.operation,
            left: this.inputs[0] || null,
            right: this.inputs[1] || null,
          }
        } else {
          expression = {
            operation: this.editValues.operation,
            inputs: this.inputs || [],
          }
        }
      }

      this.$emit('changeExpression', expression)

      // Hide the modal manually
      this.$nextTick(() => {
        this.$bvModal.hide('edit-modal-' + this.id)
      })
    },
    updateSubexpression(index, subExpression) {
      const expression = JSON.parse(JSON.stringify(this.expression))
      if (this.type === 'throttle') {
        expression.input = subExpression
      } else if (this.type === 'binary') {
        if (index === 0) {
          expression.left = subExpression
        } else if (index === 1) {
          expression.right = subExpression
        }
      } else if (this.type === 'multi') {
        expression.inputs[index] = subExpression
      } else {
        console.log(
          "Error can't update sub expression for " +
            JSON.stringify(this.expression)
        )
        return
      }

      this.$emit('changeExpression', expression)
    },
    deleteSubexpression(index) {
      const expression = JSON.parse(JSON.stringify(this.expression))
      if (this.type === 'multi') {
        expression.inputs.splice(index, 1)
      } else {
        console.log(
          "Error can't delete sub expression for " +
            JSON.stringify(this.expression)
        )
        return
      }

      this.$emit('changeExpression', expression)
    },
    addSubexpression() {
      const expression = JSON.parse(JSON.stringify(this.expression))
      if (this.type === 'multi') {
        expression.inputs.push(null)
      } else {
        console.log(
          "Error can't add sub expression for " +
            JSON.stringify(this.expression)
        )
        return
      }

      this.$emit('changeExpression', expression)
    },
    outdentSubexpression() {
      const expression = JSON.parse(JSON.stringify(this.expression))

      this.$emit('changeExpression', expression.input)
    },
    indentExpression() {
      const subExpression = JSON.parse(JSON.stringify(this.expression))
      const expression = {
        operation: 'throttle',
        cooldown_period: '0',
        input: subExpression,
      }

      this.$emit('changeExpression', expression)
    },
  },
}
</script>

<style scoped>
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
.no-underline:hover {
  text-decoration: none;
}
</style>
