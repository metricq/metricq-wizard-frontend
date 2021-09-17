import { use as ormUse, install as ormInstall } from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'
import VuexORMSearch from '@vuex-orm/plugin-search'
import database from '~/database'

ormUse(VuexORMAxios)
ormUse(VuexORMSearch, {
  shouldSort: true,
  primaryKey: true,
})

export const plugins = [ormInstall(database)]
