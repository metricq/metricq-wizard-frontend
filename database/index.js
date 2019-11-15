import { Database } from '@vuex-orm/core'
import Metric from '~/models/Metric'

const database = new Database()

// do registration of models
database.register(Metric)

export default database
