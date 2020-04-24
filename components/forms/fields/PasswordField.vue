<template>
  <div :class="outerClass">
    <label :for="'passwordfield-' + id">{{ field.label || id }}</label>
    <b-form-input
      :id="'passwordfield-' + id"
      type="password"
      required
      placeholder="duration, e.g. 10s"
      :value="data"
      @input="$emit('input', $event)"
    />
  </div>
</template>

<script>
export default {
  name: 'PasswordField',
  props: ['id', 'field', 'data', 'inline'],
  data() {
    return {
      outerClass: this.inline ? 'mb-2 mr-sm-2 mb-sm-0' : '',
    }
  },
}
</script>

<style scoped></style>
