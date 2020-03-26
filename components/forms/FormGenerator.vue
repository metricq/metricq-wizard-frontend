<template>
  <b-form :inline="inline" class="mb-2">
    <b-row :key="id" v-for="(field, id) in schema" class="mb-1">
      <b-col
        cols="1"
        class="w-100 align-content-center"
        :hidden="!fieldsSeparateSelectable"
      >
        <b-form-checkbox
          :id="'checkbox-' + id"
          v-model="selectedFields[id]"
          size="lg"
          @input="fieldSelectionChanged(id, $event)"
        ></b-form-checkbox>
      </b-col>
      <b-col>
        <component
          :is="field.type"
          :key="id"
          :id="id"
          :field="field"
          :data="formData[id]"
          :inline="inline"
          :size="size"
          :hideLabel="hideLabels"
          @input="updateData(id, $event)"
        />
      </b-col>
    </b-row>
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

export default {
  name: 'FormGenerator',
  components: {
    PasswordField,
    StringField,
    SelectField,
    NumberField,
    LabelField
  },
  props: {
    schema: {},
    value: {},
    inline: Boolean,
    size: {},
    hideLabels: Boolean,
    disableActions: Boolean,
    fieldsSeparateSelectable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const formData = {}
    const selectedFields = {}
    for (const fieldId in this.schema) {
      if (this.value && this.value[fieldId]) {
        formData[fieldId] = this.value[fieldId]
      } else if (this.schema[fieldId]) {
        formData[fieldId] = this.schema[fieldId].value
      }
      selectedFields[fieldId] = !this.fieldsSeparateSelectable
    }
    console.log(formData)
    this.$emit('input', formData)
    return {
      formData,
      selectedFields,
      buttonClass: this.inline ? 'ml-auto' : '',
      temporaryFormData: {}
    }
  },
  methods: {
    updateData(id, newVal) {
      if (this.selectedFields[id]) {
        this.$set(this.formData, id, newVal)
        this.$set(this.temporaryFormData, id, newVal)
        this.$emit('input', this.formData)
      } else {
        this.$set(this.temporaryFormData, id, newVal)
      }
    },
    fieldSelectionChanged(id, newVal) {
      if (newVal) {
        this.$set(this.formData, id, this.temporaryFormData[id])
      }
    }
  }
}
</script>

<style scoped />
