import { Client } from './ClientHierarchy'

export class Transformer extends Client {
  static entity = 'transformer'
  static baseEntity = 'client'

  static fields() {
    return {
      ...super.fields(),
      isCombinator: this.boolean(),
    }
  }
}

export default Transformer
