import Client from './Client'

export default class Source extends Client {
  static entity = 'source'
  static baseEntity = 'client'

  static fields() {
    return {
      ...super.fields(),
      type: this.string().nullable(),
      configurable: this.boolean(false),
      configItemName: this.string('config item'),
    }
  }
}
