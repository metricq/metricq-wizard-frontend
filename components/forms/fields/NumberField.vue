<template>
  <div :class="outerClass">
    <label v-if="field.label || id !== '_'" :for="'numberfield-' + id">
      {{ field.label || id }}
    </label>
    <b-form-input
      :id="'numberfield-' + id"
      type="number"
      required
      placeholder="duration, e.g. 10s"
      :size="size"
      :value="data"
      number
      @input="$emit('input', parseInt($event))"
    />
  </div>
</template>

<script>
export default {
  name: 'NumberField',
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
      type: Number,
      default: null,
    },
    inline: Boolean,
    size: {
      type: String,
      default: 'md',
    },
  },
  data() {
    return {
      outerClass: this.inline ? 'mb-2 mr-sm-2 mb-sm-0' : '',
    }
  },
}
</script>

<style scoped></style>
