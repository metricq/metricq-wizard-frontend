<template>
  <div>
    <b-navbar toggleable="lg" sticky fixed="top">
      <b-navbar-brand :to="{ name: 'index' }">
        MetricQ &#x1F9D9; ‍️
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse" />

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item
            :to="{
              name: 'metric-metric_list'
            }"
            active-class="active"
          >
            Metrics Overview
          </b-nav-item>
          <b-nav-item
            :to="{
              name: 'source-source_list'
            }"
            active-class="active"
          >
            Source Overview
          </b-nav-item>
          <b-nav-item
            :to="{
              name: 'client-client_list'
            }"
            active-class="active"
          >
            Client Overview
          </b-nav-item>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-text v-if="fetchingMetrics" class="mr-sm-2">
            <b-spinner class="ml-auto" small />
            <strong>Fetching metrics...</strong>
          </b-nav-text>
          <b-nav-text v-if="fetchingDatabases" class="mr-sm-2">
            <b-spinner class="ml-auto" small />
            <strong>Fetching databases...</strong>
          </b-nav-text>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import Metric from '~/models/Metric'
import Database from '~/models/Database'

export default {
  name: 'Navbar',
  computed: {
    fetchingMetrics() {
      return Metric.store().state.entities.metric.fetching
    },
    fetchingDatabases() {
      return Database.store().state.entities.database.fetching
    }
  }
}
</script>

<style scoped />
