import { Model } from '@vuex-orm/core'

export default class Client extends Model {
  static entity = 'client'

  static state() {
    return {
      fetching: false,
    }
  }

  static fields() {
    return {
      id: this.string().nullable(),
      hostname: this.string().nullable(),
      currentTime: this.string().nullable(),
      startingTime: this.string().nullable(),
      discoverTime: this.string().nullable(),
      uptime: this.number().nullable(),
      version: this.string().nullable(),
      metricqVersion: this.string().nullable(),
    }
  }

  static apiConfig = {
    actions: {
      reconfigureById(id) {
        return this.post(`/client/${id}/reconfigure`)
      },
    },
  }
}
