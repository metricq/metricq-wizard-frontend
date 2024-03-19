export default ({ app }, inject) => {
  inject('webview', {
    link(metrics) {
      if (metrics === undefined || metrics.lenght === 0) {
        return app.$config.metricq.webviewURL
      }

      return (
        app.$config.metricq.webviewURL + '#.now-1h*now*' + metrics.join('*')
      )
    },
  })
}
