<template>
  <div>
    <b-row>
      <b-col>
        <h1>Client Overview</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-table
          ref="metricListTable"
          :items="clients"
          :fields="['id', 'actions']"
          small
          primary-key="id"
          responsive="true"
          striped
          hover
        >
          <template v-slot:head(actions)="data">
            <span class="float-right">{{ data.label }}</span>
          </template>
          <template v-slot:cell(actions)="data">
            <b-button
              size="sm float-right"
              variant="danger"
              @click="reconfigureClient(data.item.id)"
            >
              <b-icon-bootstrap-reboot scale="1.5" />
            </b-button>
          </template>
        </b-table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  layout: 'nonfluid',
  fetch() {},
  async asyncData({ $axios }) {
    const { data } = await $axios.get(`/clients`)
    return {
      clients: data,
    }
  },
  computed: {},
  methods: {
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
  },
}
</script>

<style scoped />
