import { Database } from '@vuex-orm/core'
import Metric from '~/models/Metric'
import DatabaseModel from '~/models/Database'
import Source from '~/models/Source'

const database = new Database()

// do registration of models
database.register(Metric)
database.register(DatabaseModel)
database.register(Source)

export default database
