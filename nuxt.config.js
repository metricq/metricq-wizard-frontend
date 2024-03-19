import { sortRoutes } from '@nuxt/utils'

export default {
  ssr: false,
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/icon.png' }],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { continuous: true, height: '5px' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/vuex-orm-axios',
    '@/plugins/vue-json-edit',
    '@/plugins/vue-json-tree',
    '@/plugins/persistedState.client',
    '@/plugins/filters',
    '@/plugins/async-computed',
    '@/plugins/chartkick',
    '@/plugins/sleep',
    '@/plugins/webview',
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://bootstrap-vue.js.org
    'bootstrap-vue/nuxt',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/toast',
  ],
  bootstrapVue: { icons: true },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    prefix: '/api',
    port: process.env.NODE_ENV === 'development' ? 8000 : undefined,
  },

  dev: process.env.NODE_ENV !== 'production',

  /*
   * local configuration for
   */
  publicRuntimeConfig: {
    metricq: {
      websocketURL: process.env.METRICQ_WEBSOCKET_URL || 'ws://localhost:3003',
      webviewURL:
        process.env.METRICQ_WEBVIEW_URL || 'http://localhost:3002/webview/',
    },
  },

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, { isClient }) {
      // The internet told me to do this to fix the missing source-maps:
      // https://stackoverflow.com/questions/69206509/nuxt-how-can-i-get-sourcemap-files-and-where-can-i-find-them-in-production
      if (isClient) {
        config.devtool = 'source-map'
      }
    },
    extractCSS: true,
    analyze: false,
  },
  toast: {
    position: 'top-right',
    duration: 5000,
    // you can pass a single action as below
    action: {
      text: 'Close',
      onClick: (e, toastObject) => {
        toastObject.goAway(0)
      },
    },
    theme: 'outline',
  },
  router: {
    base: '/',
    extendRoutes(routes, resolve) {
      // add redirect from /metric to /metric/{id} with empty id
      routes.push({
        name: 'metric',
        path: '/metric',
        redirect: { name: 'metric-metricId', metricId: '' },
      })
      // it's voodoo needed to make the /metric/{id} magic work
      sortRoutes(routes)
    },
  },
}
