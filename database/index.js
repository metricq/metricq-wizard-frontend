import { Database } from '@vuex-orm/core'
import { Client, Source } from '~/models/ClientHierarchy'
import Metric from '~/models/Metric'
import DatabaseModel from '~/models/Database'
import Transformer from '~/models/Transformer'

const database = new Database()

// The registration of models in no particular order
// but the base class for client models before the inherited ones

database.register(Client)
database.register(Source)
database.register(Transformer)

// doesn't inherit from Client, yet
database.register(DatabaseModel)

database.register(Metric)

export default database
