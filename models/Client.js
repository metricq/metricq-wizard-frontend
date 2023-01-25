import { Model } from '@vuex-orm/core'
import { Source } from './ClientHierarchy.js'

export class Client extends Model {
  static entity = 'client'

  static typeKey = 'client_model_type'

  static types() {
    return {
      CLIENT: Client,
      SOURCE: Source,
    }
  }

  static state() {
    return {
      fetching: false,
    }
  }

  static fields() {
    return {
      id: this.string().nullable(),
      client_model_type: this.attr('CLIENT'),
      hasConfiguration: this.boolean(false),
      hostname: this.string().nullable(),
      currentTime: this.string().nullable(),
      startingTime: this.string().nullable(),
      discoverTime: this.string().nullable(),
      uptime: this.number().nullable(),
      version: this.string().nullable(),
      metricqVersion: this.string().nullable(),
    }
  }

  async reconfigure() {
    return await Client.api().post(`/client/${this.id}/reconfigure`, null, {
      save: false,
    })
  }
}

export default Client
