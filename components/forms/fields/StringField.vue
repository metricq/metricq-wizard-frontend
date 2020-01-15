<template>
  <div :class="outerClass">
    <label :for="'stringfield-' + id">{{ field.label || id }}</label>
    <b-form-input
      :id="'stringfield-' + id"
      required
      placeholder="duration, e.g. 10s"
      :value="data"
      @input="$emit('input', $event)"
    />
  </div>
</template>

<script>
export default {
  name: 'StringField',
  props: ['id', 'field', 'data', 'inline'],
  data() {
    return {
      outerClass: this.inline ? 'mb-2 mr-sm-2 mb-sm-0' : ''
    }
  }
}
</script>

<style scoped></style>
