import Vue from 'vue'
import moment from 'moment'

// source: https://stackoverflow.com/a/50909377
Vue.filter('momentago', function (date) {
  return moment(date).fromNow()
})
