<template>
  <b-container fluid>
    <div>
      <b-row>
        <b-col sm="3"></b-col>
        <b-col align="center">
          <h1>
            metricq-&#x1F9D9;-frontend
          </h1>
          <p class="lead">
            A configuration web app for MetricQ
          </p>
        </b-col>
        <b-col sm="3"></b-col>
      </b-row>
      <b-row>
        <b-col
          ><b-button @click="loadExampleData">
            Load example data
          </b-button></b-col
        >
      </b-row>
    </div>
  </b-container>
</template>

<script>
import Metric from '~/models/Metric'
import Database from '~/models/Database'

export default {
  components: {},
  computed: {
    selected() {
      return Metric.query()
        .with('database')
        .where('selected', true)
        .get()
    }
  },
  asyncData({ query }) {},
  methods: {
    loadExampleData() {
      const metrics = [
        {
          _id: 'metricq.vm.cpu.usage',
          rate: 1,
          description: 'CPU usage (100% = 1 logical CPU busy)',
          unit: '%',
          source: 'source-sysinfo',
          historic: true
        },
        {
          _id: 'metricq.vm.mem.active',
          rate: 1,
          description:
            'See https://psutil.readthedocs.io/en/latest/#psutil.virtual_memory',
          unit: 'B',
          source: 'source-sysinfo',
          historic: true
        },
        {
          _id: 'metricq.vm.mem.available',
          rate: 1,
          description:
            'See https://psutil.readthedocs.io/en/latest/#psutil.virtual_memory',
          unit: 'B',
          source: 'source-sysinfo',
          historic: true
        },
        {
          _id: 'metricq.vm.mem.buffers',
          rate: 1,
          description:
            'See https://psutil.readthedocs.io/en/latest/#psutil.virtual_memory',
          unit: 'B',
          source: 'source-sysinfo',
          historic: true
        },
        {
          _id: 'metricq.vm.mem.cached',
          rate: 1,
          description:
            'See https://psutil.readthedocs.io/en/latest/#psutil.virtual_memory',
          unit: 'B',
          source: 'source-sysinfo',
          historic: true
        },
        {
          _id: 'metricq.vm.mem.free',
          rate: 1,
          description:
            'See https://psutil.readthedocs.io/en/latest/#psutil.virtual_memory',
          unit: 'B',
          source: 'source-sysinfo',
          historic: true
        },
        {
          _id: 'metricq.vm.mem.inactive',
          rate: 1,
          description:
            'See https://psutil.readthedocs.io/en/latest/#psutil.virtual_memory',
          unit: 'B',
          source: 'source-sysinfo',
          historic: true
        },
        {
          _id: 'metricq.vm.mem.percent',
          rate: 1,
          description:
            'See https://psutil.readthedocs.io/en/latest/#psutil.virtual_memory',
          unit: '%',
          source: 'source-sysinfo',
          historic: true
        },
        {
          _id: 'metricq.vm.mem.shared',
          rate: 1,
          description:
            'See https://psutil.readthedocs.io/en/latest/#psutil.virtual_memory',
          unit: 'B',
          historic: true
        },
        {
          _id: 'metricq.vm.mem.slab',
          rate: 1,
          description:
            'See https://psutil.readthedocs.io/en/latest/#psutil.virtual_memory',
          unit: 'B',
          source: 'source-sysinfo',
          historic: true
        },
        {
          _id: 'metricq.vm.mem.total',
          rate: 1,
          description:
            'See https://psutil.readthedocs.io/en/latest/#psutil.virtual_memory',
          unit: 'B',
          source: 'source-sysinfo',
          historic: true
        },
        {
          _id: 'metricq.vm.mem.used',
          rate: 1,
          description:
            'See https://psutil.readthedocs.io/en/latest/#psutil.virtual_memory',
          unit: 'B',
          source: 'source-sysinfo',
          historic: true
        }
      ]

      Database.insertOrUpdate({
        data: {
          id: 'db-hta-metricq'
        }
      })

      for (const [, item] of Object.entries(metrics)) {
        const data = {
          id: item._id,
          ...item
        }
        if (data.historic) {
          data.databaseId = 'db-hta-metricq'
        }
        console.log(data)
        Metric.insertOrUpdate({
          data
        })
      }
    }
  }
}
</script>

<style></style>
