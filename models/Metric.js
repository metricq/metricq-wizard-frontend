import { Model } from '@vuex-orm/core'
import Database from '~/models/Database'
import Source from '~/models/Source'

export default class Metric extends Model {
  static entity = 'metric'

  static state() {
    return {
      fetching: false,
    }
  }

  static fields() {
    return {
      id: this.string().nullable(),
      rate: this.number().nullable(),
      description: this.string().nullable(),
      unit: this.string().nullable(),
      source: this.string().nullable(),
      sourceRef: this.belongsTo(Source, 'source'),
      historic: this.boolean(false),
      additionalMetadata: this.attr().nullable(),
      // Database settings
      databaseId: this.string().nullable(),
      database: this.belongsTo(Database, 'databaseId'),
      intervalMin: this.string().nullable(),
      intervalMax: this.string().nullable(),
      intervalFactor: this.number().nullable(),
      // Client side stat
      selected: this.boolean(false),
      saving: this.boolean(false),
    }
  }

  static convertMetricListResponse({ data, headers }) {
    return data.map((currentValue) => {
      const {
        id,
        description,
        unit,
        source,
        rate,
        historic,
        ...unfilteredAdditionalMetadata
      } = currentValue
      const additionalMetadata = Object.keys(unfilteredAdditionalMetadata)
        .filter((key) => !key.startsWith('_'))
        .reduce((obj, key) => {
          obj[key] = unfilteredAdditionalMetadata[key]
          return obj
        }, {})
      return {
        id,
        description,
        unit,
        source,
        historic,
        rate,
        additionalMetadata,
      }
    })
  }
}
