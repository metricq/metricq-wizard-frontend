import { Database } from '@vuex-orm/core'
import Metric from '~/models/Metric'
import DatabaseModel from '~/models/Database'

const database = new Database()

// do registration of models
database.register(Metric)
database.register(DatabaseModel)

export default database
