<template>
  <b-form :inline="inline" class="mb-2">
    <component
      :is="field.type"
      v-for="(field, id) in schema"
      :id="id"
      :key="id"
      :field="field"
      :data="formData[id]"
      :inline="inline"
      :size="size"
      :hide-label="hideLabels"
      @input="updateData(id, $event)"
    />
    <div v-if="!disableActions">
      <label v-if="inline">&nbsp;</label>
      <slot name="actions">
        <b-button type="submit" variant="primary" :class="buttonClass">
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
import NumberField from './fields/NumberField'
import LabelField from './fields/LabelField'
import JSONField from './fields/JSONField'

export default {
  name: 'FormGenerator',
  components: {
    PasswordField,
    StringField,
    SelectField,
    NumberField,
    LabelField,
    JSONField,
  },
  props: {
    schema: {
      type: Object,
      required: true,
    },
    value: {
      type: Object,
      default: null,
    },
    inline: Boolean,
    size: {
      type: String,
      default: 'md',
    },
    hideLabels: Boolean,
    disableActions: Boolean,
  },
  data() {
    const formData = {}
    for (const fieldId in this.schema) {
      if (this.value && this.value[fieldId]) {
        formData[fieldId] = this.value[fieldId]
      } else if (this.schema[fieldId]) {
        formData[fieldId] = this.schema[fieldId].value
      }
    }
    this.$emit('input', formData)
    return {
      formData,
      buttonClass: this.inline ? 'ml-auto' : '',
    }
  },
  methods: {
    updateData(id, newVal) {
      this.$set(this.formData, id, newVal)
      this.$emit('input', this.formData)
    },
  },
}
</script>

<style scoped />
