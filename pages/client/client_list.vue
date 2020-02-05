<template>
  <div class="p-2">
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
          <template v-slot:cell(actions)="data">
            <b-button
              size="sm float-right"
              @click="reconfigureClient(data.item.id)"
            >
              Send configuration
            </b-button>
          </template>
        </b-table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  fetch() {},
  async asyncData({ $axios }) {
    const { data } = await $axios.get(`/clients`)
    return {
      clients: data
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
          centered: true
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
    }
  }
}
</script>

<style scoped />
