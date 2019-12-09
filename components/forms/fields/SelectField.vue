<template>
  <div class="mb-2 mr-sm-2 mb-sm-0">
    <label :for="'selectfield-' + id">{{ id }}</label>
    <b-form-select
      :id="'selectfield-' + id"
      :options="field.options"
      :value="data"
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
  props: ['id', 'field', 'data']
}
</script>

<style scoped></style>
