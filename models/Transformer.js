import { Model } from '@vuex-orm/core'

export default class Transformer extends Model {
  static entity = 'transformer'

  static state() {
    return {
      fetching: false,
    }
  }

  static fields() {
    return {
      id: this.string().nullable(),
      isCombinator: this.boolean(),
    }
  }
}
