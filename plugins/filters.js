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

Vue.filter('humanizeRate', function (rate) {
  // we get a float representing the sampling rate
  // so let's calculate an interval
  const interval = moment.duration(1 / rate, 'seconds')

  if (interval.asHours() >= 1) {
    return `1 / ${interval.asHours()} h`
  } else if (interval.asMinutes() >= 1) {
    return `1 / ${interval.asMinutes()} min`
  } else if (interval.asSeconds() > 1) {
    return `1 / ${interval.asSeconds()} s`
  } else {
    return `${parseFloat(rate.toFixed(2))} Hz`
  }
})
