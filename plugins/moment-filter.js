import Vue from 'vue'
import moment from 'moment'

// source: https://stackoverflow.com/a/50909377
Vue.filter('momentAgo', function (date) {
  return moment(date).fromNow()
})

Vue.filter('momentDuration', function (duration) {
  if (Number.isInteger(duration)) {
    return moment.duration(duration / 1000 / 1000, 'milliseconds').humanize()
  } else {
    return moment.duration(duration, 'seconds').humanize()
  }
})
