<template>
  <div :class="outerClass">
    <label v-if="field.label || id !== '_'" :for="'passwordfield-' + id">
      {{ field.label || id }}
    </label>
    <b-form-input
      :id="'passwordfield-' + id"
      type="password"
      required
      placeholder="duration, e.g. 10s"
      :size="size"
      :value="data"
      @input="$emit('input', $event)"
    />
  </div>
</template>

<script>
export default {
  name: 'PasswordField',
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
      type: String,
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
