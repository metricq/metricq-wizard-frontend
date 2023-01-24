import Source from '~/models/Source'
import Client from '~/models/Client'

export default ({ app }, inject) => {
  inject('fetchClients', async () => {
    Client.commit((state) => {
      state.fetching = true
    })

    await Promise.all([
      Client.api().get('/clients'),
      Source.api().get('/sources'),
      Client.api().get('/clients/active'),
    ])

    Client.commit((state) => {
      state.fetching = false
    })
  })
}
