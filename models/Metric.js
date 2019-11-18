import { Model } from '@vuex-orm/core'
import Database from '~/models/Database'

export default class Metric extends Model {
  static entity = 'metric'

  static fields() {
    return {
      id: this.string().nullable(),
      rate: this.number().nullable(),
      description: this.string().nullable(),
      unit: this.string().nullable(),
      source: this.string().nullable(),
      historic: this.boolean(false),
      database_id: this.string().nullable(),
      database: this.belongsTo(Database, 'database_id'),
      // Client side stat
      selected: this.boolean(false)
    }
  }
}
