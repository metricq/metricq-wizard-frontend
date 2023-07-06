<template>
  <div>
    <b-overlay :show="isOverlayVisible" rounded="sm">
      <template #overlay>
        <div>
          <h3>Scanning...</h3>
          <b-progress
            :value="progress"
            :max="duration * 1000"
            animated
          ></b-progress>
        </div>
      </template>
      <slot />
    </b-overlay>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  props: {
    duration: { type: Number, required: true },
  },
  data() {
    return {
      isOverlayVisible: false,
      progress: 0,
      intervalId: null,
    }
  },
  methods: {
    async showOverlay() {
      this.isOverlayVisible = true
      await this.startTimer()
      this.isOverlayVisible = false
    },
    async startTimer() {
      this.progress = 0

      const startTime = moment()

      while (moment().diff(startTime) < this.duration * 1000) {
        await this.$sleep(1)
        this.progress = moment().diff(startTime)
      }
    },
  },
}
</script>
