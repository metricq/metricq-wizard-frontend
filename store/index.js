import VuexORM from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'
import VuexORMSearch from '@vuex-orm/plugin-search'
import database from '~/database'

VuexORM.use(VuexORMAxios, { baseURL: 'http://localhost:8000/api/' })
VuexORM.use(VuexORMSearch, {
  shouldSort: true,
  primaryKey: true
})

export const plugins = [VuexORM.install(database)]
