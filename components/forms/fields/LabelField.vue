<template>
  <div :class="outerClass">
    <label>{{ data }}</label>
  </div>
</template>

<script>
export default {
  name: 'LabelField',
  props: ['id', 'field', 'data', 'inline'],
  data() {
    return {
      outerClass: this.inline ? 'mb-2 mr-sm-2 mb-sm-0' : '',
    }
  },
}
</script>

<style scoped></style>
