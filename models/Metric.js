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

  static async deleteMetadata(metrics) {
    // This isn't a typical REST request, so DO NOT save it. In
    // general, a POST request is assumed to return new elements
    // to be stored in the model, which we don't do here. Instead,
    // we want to delete. While it's akin to a DELETE request,
    // it's not for one resource, but for many metrics at once.
    // So we can't use the `delete()` method instead.
    const { response } = await Metric.api().post(
      `/metrics/delete_metadata`,
      { metrics },
      {
        save: false,
        // we need to disable the status check, because the
        // server will return a 400 if the metrics don't exist.
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 400,
      }
    )

    // whether the request was okay or not, it still contains
    // the list of actually deleted metrics. These can be removed.
    // Technically speaking, other sessions won't be notified,
    // but nothing else does it either.
    response.data.deleted.forEach((id) => Metric.delete(id))

    return response
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
