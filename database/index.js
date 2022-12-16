import { Database } from '@vuex-orm/core'
import Client from '~/models/Client'
import Source from '~/models/Source'
import Metric from '~/models/Metric'
import DatabaseModel from '~/models/Database'
import Transformer from '~/models/Transformer'

const database = new Database()

// do registration of models
database.register(Client)
database.register(Metric)
database.register(DatabaseModel)
database.register(Source)
database.register(Transformer)

export default database
