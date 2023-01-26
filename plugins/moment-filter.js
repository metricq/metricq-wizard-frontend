import Vue from 'vue'
import moment from 'moment'

// source: https://stackoverflow.com/a/50909377
Vue.filter('momentAgo', function (date) {
  return moment(date).fromNow()
})

Vue.filter('momentDuration', function (duration) {
  // If duration is an integer that is reasonably larger than
  // the time since unix epoch in nanoseconds, we assume the
  // given duration is in nanoseconds.
  // If it's a floating point or relatively small, we assume
  // the duration is given in seconds.
  if (Number.isInteger(duration) && duration > 1e18) {
    return moment.duration(duration / 1000 / 1000, 'milliseconds').humanize()
  } else {
    return moment.duration(duration, 'seconds').humanize()
  }
})
