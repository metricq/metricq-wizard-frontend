<template>
  <div :class="outerClass">
    <label v-if="!hideLabel" :for="'selectfield-' + id">{{
      field.label || id
    }}</label>
    <b-form-select
      :id="'selectfield-' + id"
      :options="field.options"
      :value="data"
      :size="size"
      required
      @input="$emit('input', $event)"
    >
      <template v-if="insertChoose" #first>
        <option :value="undefined">Choose...</option>
      </template>
    </b-form-select>
  </div>
</template>

<script>
export default {
  name: 'SelectField',
  props: {
    id: {
      type: String,
      required: true,
    },
    field: {
      type: Object,
      required: true,
    },
    data: {
      type: [String, Number],
      default: undefined,
    },
    inline: Boolean,
    size: {
      type: String,
      default: 'md',
    },
    hideLabel: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      insertChoose:
        this.field.options.reduce((o, item) => {
          if (item.value === undefined) {
            return false
          }
          return o && true
        }, true) && this.data === undefined,
      outerClass: this.inline ? 'mb-2 mr-sm-2 mb-sm-0' : '',
    }
  },
}
</script>

<style scoped></style>
