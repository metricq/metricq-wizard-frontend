import Vue from 'vue'
import Chartkick from 'vue-chartkick'

// While chartkick supports multiple backends, we are using Highcharts.
// However, each option has drawbacks:
// - Chart.js don't work well for the use case of live data drawing.
//   (Axes are fiddly, performance problems when drawing)
//   While not supported though chartkick, this also applies to apexcharts
// - Google Charts aren't available through npm, but require a download
//   request in every user browser session to google. That's a no starter.
// - Highcharts has licensing issues. In particular, it is CC nc-by-3.0.
import Highcharts from 'highcharts'
import HighchartsVue from 'highcharts-vue'

import sankey from 'highcharts/modules/sankey'
import dependencyWheel from 'highcharts/modules/dependency-wheel'

sankey(Highcharts)
dependencyWheel(Highcharts)

Vue.use(Chartkick.use(Highcharts))
Vue.use(HighchartsVue)

Highcharts.setOptions({
  global: {
    useUTC: false,
  },
  plotOptions: {
    series: {
      animation: false,
    },
  },
})
