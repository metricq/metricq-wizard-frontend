import { Model } from '@vuex-orm/core'
import Metric from '~/models/Metric'

export default class Database extends Model {
  static entity = 'database'

  static fields() {
    return {
      id: this.string().nullable(),
      metrics: this.hasMany(Metric, 'databaseId')
    }
  }
}
