<template>
  <div :class="outerClass">
    <label v-if="field.label || id !== '_'" :for="'jsonfield-' + id">
      {{ field.label || id }}
    </label>
    <JsonEditor
      :id="'jsonfield-' + id"
      :value="data"
      :obj-data="data"
      is-edit="true"
      @input="$emit('input', $event)"
    ></JsonEditor>
  </div>
</template>

<script>
export default {
  name: 'JSONField',
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
      type: Object,
      default: () => {
        return {}
      },
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
