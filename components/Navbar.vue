<template>
  <div>
    <b-navbar toggleable="lg" sticky fixed="top">
      <b-navbar-brand href="#">NavBar</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item
            :to="{
              name: 'metric-metric_list'
            }"
          >
            Metrics Overview
          </b-nav-item>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-text class="mr-sm-2" v-if="fetchingMetrics">
            <b-spinner class="ml-auto" small></b-spinner>
            <strong>Fetching metrics...</strong>
          </b-nav-text>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import Metric from '~/models/Metric'

export default {
  name: 'Navbar',
  computed: {
    fetchingMetrics() {
      return Metric.store().state.entities.metric.fetching
    }
  }
}
</script>

<style scoped></style>
