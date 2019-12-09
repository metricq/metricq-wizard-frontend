<template>
  <div class="mb-2 mr-sm-2 mb-sm-0">
    <label :for="'stringfield-' + id">{{ id }}</label>
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
  props: ['id', 'field', 'data']
}
</script>

<style scoped></style>
