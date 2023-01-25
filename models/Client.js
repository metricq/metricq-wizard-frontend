import { Model } from '@vuex-orm/core'
import { Source, Transformer } from './ClientHierarchy.js'

export class Client extends Model {
  static entity = 'client'

  static typeKey = 'client_model_type'

  static types() {
    return {
      CLIENT: Client,
      SOURCE: Source,
      TRANSFORMER: Transformer,
    }
  }

  static state() {
    return {
      fetching: false,
    }
  }

  static fields() {
    return {
      id: this.string(null).nullable(),
      client_model_type: this.attr('CLIENT'),
      hasConfiguration: this.boolean(false),
      hostname: this.string(null).nullable(),
      currentTime: this.string(null).nullable(),
      startingTime: this.string(null).nullable(),
      discoverTime: this.string(null).nullable(),
      uptime: this.number(null).nullable(),
      version: this.string(null).nullable(),
      metricqVersion: this.string(null).nullable(),
    }
  }

  async reconfigure() {
    return await Client.api().post(`/client/${this.id}/reconfigure`, null, {
      save: false,
    })
  }

  static async fetchAll() {
    Client.commit((state) => {
      state.fetching = true
    })

    await Promise.all([
      Client.api().get('/clients'),
      Source.api().get('/sources'),
      Client.api().get('/clients/active'),
    ])

    Client.commit((state) => {
      state.fetching = false
    })
  }
}

export default Client
