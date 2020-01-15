<template>
  <b-form :inline="inline" class="mb-2">
    <component
      :is="field.type"
      v-for="(field, id) in schema"
      :key="id"
      :id="id"
      :field="field"
      :data="formData[id]"
      :inline="inline"
      @input="updateData(id, $event)"
    />
    <div>
      <label>&nbsp;</label>
      <slot name="actions">
        <b-button type="submit" variant="primary">
          Submit
        </b-button>
      </slot>
    </div>
  </b-form>
</template>

<script>
import StringField from './fields/StringField'
import SelectField from './fields/SelectField'
import PasswordField from './fields/PasswordField'

export default {
  name: 'FormGenerator',
  components: { PasswordField, StringField, SelectField },
  props: ['schema', 'value', 'inline'],
  data() {
    return {
      formData: this.value
    }
  },
  methods: {
    updateData(id, newVal) {
      this.$set(this.formData, id, newVal)
      this.$emit('input', this.formData)
    }
  }
}
</script>

<style scoped />
