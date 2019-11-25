import VuexORM from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'
import database from '~/database'

VuexORM.use(VuexORMAxios, { baseURL: 'http://localhost:8000/api/' })

export const plugins = [VuexORM.install(database)]
