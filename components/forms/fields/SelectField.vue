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
      <template v-slot:first>
        <option :value="undefined">Choose...</option>
      </template>
    </b-form-select>
  </div>
</template>

<script>
export default {
  name: 'SelectField',
  props: {
    id: String,
    field: Object,
    data: {},
    inline: Boolean,
    size: {
      type: String,
      default: ''
    },
    hideLabel: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      outerClass: this.inline ? 'mb-2 mr-sm-2 mb-sm-0' : ''
    }
  }
}
</script>

<style scoped></style>
