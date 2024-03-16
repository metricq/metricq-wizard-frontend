<template>
  <div>
    <b-row>
      <b-col>
        <h1>
          Client Overview 📟
          <span class="lead">Configure clients running in the cluster</span>
        </h1>
      </b-col>
    </b-row>

    <b-row class="mb-4">
      <b-col>
        <b-card no-body header="Dependency Graph">
          <highcharts ref="chart" :options="chartOptions" />
        </b-card>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <LoadingOverlay ref="overlay" :duration="10">
          <b-card no-body class="mb-3">
            <b-card-header>
              <b-row>
                <b-col>
                  <b-input-group size="sm" prepend="Filter">
                    <b-form-input
                      id="filter-input"
                      v-model="filter"
                      type="search"
                      debounce="200"
                      :autofocus="true"
                      :disabled="clientFilterList !== null"
                      placeholder="Type to Search"
                    />
                    <b-input-group-append>
                      <b-button
                        :disabled="!filter"
                        :variant="filter ? 'primary' : 'secondary'"
                        @click=";(filter = ''), (clientFilterList = null)"
                      >
                        Clear
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-col>
                <b-col align="right">
                  <b-button variant="info" @click="updateTopology">
                    <b-icon-arrow-repeat />
                    Re-scan Cluster for active Clients
                  </b-button>
                </b-col>
              </b-row>
            </b-card-header>

            <b-table
              ref="metricListTable"
              :items="clients"
              :fields="[
                { key: 'id', sortable: true },
                { key: 'hostname', sortable: true },
                { key: 'version', sortable: true },
                { key: 'metricqVersion', sortable: true },
                { key: 'startingTime', sortable: true },
                { key: 'discoverTime', sortable: true },
                { key: 'actions' },
              ]"
              small
              :per-page="perPage"
              :current-page="currentPage"
              :filter="filter"
              :filter-function="clientFilterFunction"
              primary-key="id"
              responsive="true"
              sort-by="id"
              sort-icon-left
              sort-null-last
              striped
              hover
              class="mb-0"
              show-empty
              @filtered="onFiltered"
            >
              <template #head(discoverTime)> Last seen </template>
              <template #cell(discoverTime)="data">
                <template v-if="data.item.discoverTime">
                  <span
                    v-b-tooltip.hover.noninteractive
                    :title="data.item.discoverTime"
                  >
                    {{ data.item.discoverTime | momentAgo }}
                  </span>
                </template>
                <template v-else>never seen</template>
              </template>
              <template #head(startingTime)> Started </template>
              <template #cell(startingTime)="data">
                <template v-if="data.item.startingTime">
                  <span
                    v-b-tooltip.hover.noninteractive
                    :title="data.item.startingTime"
                  >
                    {{ data.item.startingTime | momentAgo }}
                  </span>
                </template>
              </template>
              <template #head(actions)="data">
                <span class="float-right">{{ data.label }}</span>
              </template>
              <template #cell(actions)="data">
                <client-actions :show-delete="true" :client="data.item" />
              </template>
              <template #emptyfiltered>
                <b-jumbotron
                  header="No client matches the input"
                  bg-variant="grey"
                >
                  <b-button
                    v-b-modal.new-client-modal
                    variant="primary"
                    href="#"
                    size="lg"
                  >
                    <b-icon-plus />
                  </b-button>

                  Create an empty configuration for the token
                  <span class="p-1 text-monospace">"{{ filter }}"</span>
                  instead?
                </b-jumbotron>
              </template>
            </b-table>
            <b-card-footer>
              <b-row align-v="center">
                <b-col>
                  <span>
                    Total clients: {{ clients.length }}
                    <template v-if="filter">
                      ({{ totalRows }} matching)
                    </template>
                  </span>
                </b-col>
                <b-col>
                  <b-pagination
                    v-if="clients.length > perPage"
                    v-model="currentPage"
                    :total-rows="totalRows"
                    :per-page="perPage"
                    first-number
                    last-number
                    class="justify-content-center"
                  />
                </b-col>
                <b-col class="text-right">
                  Clients per page
                  <b-form-select
                    v-model="perPage"
                    :options="[10, 20, 50, 100, 200, 500]"
                    size="sm"
                    class="w-25"
                  />
                </b-col>
              </b-row>
            </b-card-footer>
          </b-card>
        </LoadingOverlay>
      </b-col>
    </b-row>
    <b-modal
      id="new-client-modal"
      title="Create Client"
      :lazy="true"
      @ok="createClient"
    >
      <p class="my-4">
        Create empty config for <span class="lead">{{ filter }}</span>
        ?
      </p>
    </b-modal>
  </div>
</template>

<script>
import ClientActions from '~/components/ClientActions.vue'
import Client from '~/models/Client'
import LoadingOverlay from '~/components/LoadingOverlay.vue'

export default {
  components: { ClientActions, LoadingOverlay },
  asyncData({ params }) {
    return {
      filter: params.filter !== undefined ? params.filter : null,
      perPage: 20,
      currentPage: 1,
      totalRows: 0,
      dependencies: [],
      clientFilterList: null,
    }
  },
  async fetch() {
    await Client.fetchAll()
    this.totalRows = Client.query().count()
    this.$axios.get(`/clients/dependencies`).then(({ data }) => {
      this.dependencies = data

      // hide the loading displayed in the highcharts chart
      // $ref.chart is the vue tag, chart is the Highchart instance,
      // which we call hideLoading() on
      // See also: https://github.com/highcharts/highcharts-vue/issues/100
      this.$refs.chart.chart.hideLoading()
    })
  },
  computed: {
    clients() {
      return Client.query().all()
    },
    chartOptions() {
      return {
        title: null,
        chart: {
          events: {
            load() {
              // once the chart is mounted, we directly show
              // a "loading" message while the data is being fetched
              this.showLoading()
            },
          },
        },
        series: [
          {
            keys: ['from', 'to', 'weight'],
            data: this.dependencies,
            type: 'dependencywheel',
            name: 'Amount of metrics consumed',
            minLinkWidth: 1,
            events: {
              click: this.onChartClick,
            },
          },
        ],
      }
    },
  },
  watch: {
    filter(value) {
      // This watcher embeds the filter value into the URL, so when users browse
      // forth and back, the filter will be set to the old value.

      // However, when you click in the fancy sankey-circle, we apply special
      // filters directly from information only available in the thing.
      // I'm to stupid to replicate these fancy filters in code. If you want to
      // give it a try, look at the `onChartClick()` method down below.
      // So instead, we pretend there was no filter set. These fancy filters
      // start with $something, but no client token will ever do that.
      // Hence this:
      if (value.startsWith('$')) {
        value = null
      }

      // now we use the router to generate the url...
      const resolved = this.$router.resolve({
        name: 'client-list-filter',
        params: { filter: value },
      })

      // and push that into the history. What the first two parameters do?
      // Why there isn't a simply method in the router to achieve this? Idk.
      // I guess the answer is: "because javascript".
      history.pushState({}, null, resolved.href)
    },
  },
  methods: {
    onFiltered(_filteredItems, filteredItemsCount) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItemsCount
      this.currentPage = 1
    },
    onChartClick({ point }) {
      if (point.formatPrefix === 'node') {
        const metrics = [point.id]

        for (const { from } of point.linksTo) {
          metrics.push(from)
        }
        for (const { to } of point.linksFrom) {
          metrics.push(to)
        }
        this.clientFilterList = metrics
        this.filter = `$dependencies(${point.id})`
      } else {
        this.clientFilterList = [point.fromNode.id, point.toNode.id]
        this.filter = `$link(${point.fromNode.id}, ${point.toNode.id})`
      }
    },
    clientFilterFunction(data, filter) {
      if (this.clientFilterList === null) {
        return (
          data.id.includes(filter) ||
          (data.hostname != null && data.hostname.includes(filter))
        )
      } else {
        return this.clientFilterList.includes(data.id)
      }
    },
    async editRawConfig(clientId) {
      const answer = await this.$bvModal.msgBoxConfirm(
        this.guiForConfigExists(clientId)
          ? `The wizard has a better way to edit the config of client ${clientId}. Do you REALLY want to edit the raw JSON config?`
          : `Do you really want to edit the raw JSON config of client ${clientId}?`,
        {
          title: 'Are you sure?',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: this.guiForConfigExists(clientId)
            ? 'Yes, I really want it'
            : 'YES',
          cancelTitle: 'NO',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true,
        }
      )
      if (answer) {
        await this.$router.push({
          name: 'client-edit_json-clientId',
          params: { clientId },
        })
      }
    },
    async reconfigureClient(clientId) {
      const answer = await this.$bvModal.msgBoxConfirm(
        `Really reconfigure ${clientId}?`,
        {
          title: 'Please Confirm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'YES',
          cancelTitle: 'NO',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true,
        }
      )
      if (answer) {
        const { status } = await this.$axios.post(
          `/client/${clientId}/reconfigure`
        )
        if (status === 200) {
          this.$toast.success('Requested client reconfiguration!')
        } else {
          this.$toast.error('Client reconfiguration failed!')
        }
      }
    },
    guiForConfigExists(clientId) {
      return (
        clientId.startsWith('db-') ||
        clientId.startsWith('source-') ||
        (clientId.startsWith('transformer') && clientId.endsWith('-combinator'))
      )
    },
    async updateTopology() {
      await this.$axios.post(`/discover`)

      await this.$refs.overlay.showOverlay()

      this.$nuxt.refresh()
    },
    async createClient() {
      await this.$axios.put(`/client/${this.filter}`)
      this.$nuxt.refresh()
    },
  },
}
</script>

<style scoped />
