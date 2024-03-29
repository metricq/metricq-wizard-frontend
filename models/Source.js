import { Client } from './ClientHierarchy'

export class Source extends Client {
  static entity = 'source'
  static baseEntity = 'client'

  static fields() {
    return {
      ...super.fields(),
      type: this.string(null).nullable(),
      configurable: this.boolean(false),
      configItemName: this.string('config item'),
    }
  }
}

export default Source
