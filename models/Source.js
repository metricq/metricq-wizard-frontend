import { Model } from '@vuex-orm/core'

export default class Source extends Model {
  static entity = 'source'

  static state() {
    return {
      fetching: false
    }
  }

  static fields() {
    return {
      id: this.string().nullable(),
      searchParams: this.attr({}),
      selectedMetrics: this.attr([])
    }
  }

  static apiConfig = {
    actions: {
      reconfigureById(id) {
        return this.post(`/source/${id}/reconfigure`)
      }
    }
  }
}
