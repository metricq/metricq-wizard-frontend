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
      type: this.string().nullable(),
      configurable: this.boolean(false),
      configItemName: this.string('config item')
    }
  }

  static apiConfig = {
    actions: {
      reconfigureById(id) {
        return this.post(`/source/${id}/reconfigure`)
      }
    }
  }

  static async fetchSources() {
    this.commit((state) => {
      state.fetching = true
    })
    await this.api()
      .get('/sources')
      .finally(() => {
        this.commit((state) => {
          state.fetching = false
        })
      })
  }
}
