import { Model } from '@vuex-orm/core'
import Database from '~/models/Database'

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
      sourceType: this.string('source').nullable(),
      sourceRef: this.morphTo('source', 'sourceType'),
      historic: this.boolean(false),
      lastMetadataUpdateStr: this.string().nullable(),
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

  get lastMetadataUpdate() {
    return new Date(this.lastMetadataUpdateStr)
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
        date,
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
        lastMetadataUpdateStr: date,
        additionalMetadata,
      }
    })
  }
}
