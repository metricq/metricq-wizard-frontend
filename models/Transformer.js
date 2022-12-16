import Client from './Client'

export default class Transformer extends Client {
  static entity = 'transformer'
  static baseEntity = 'client'

  static state() {
    return {
      fetching: false,
    }
  }

  static fields() {
    return {
      ...super.fields(),
      isCombinator: this.boolean(),
    }
  }
}
