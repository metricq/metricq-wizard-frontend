<template>
  <div>
    <b-row>
      <b-col>
        <h1>
          Source {{ sourceId }} 🔧
          <span class="lead">Add new {{ source.configItemName }}</span>
        </h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <FormGenerator v-model="formData" :schema="schema">
          <template #actions>
            <b-button
              :to="{
                name: 'source-config_item_list-sourceId',
                params: {
                  sourceId: sourceId,
                },
              }"
              class="mt-1"
              variant="danger"
            >
              Back to {{ source.configItemName }} list
            </b-button>
            <b-button
              :disabled="adding"
              variant="primary"
              class="mt-1 float-right"
              @click="addConfigItem()"
            >
              <b-spinner v-if="adding" class="ml-auto" small />
              Add {{ source.configItemName }}
            </b-button>
          </template>
        </FormGenerator>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import FormGenerator from '~/components/forms/FormGenerator'
import Source from '~/models/Source'

export default {
  components: { FormGenerator },
  layout: 'nonfluid',
  async asyncData({ $axios, params, store }) {
    const { data } = await $axios.get(
      `/source/${params.sourceId}/config_items/input_form`,
      {
        params: {
          session: store.state.session.sessionKey,
        },
      }
    )
    return {
      sourceId: params.sourceId,
      schema: data,
      formData: {},
      adding: false,
    }
  },
  computed: {
    source() {
      return Source.query().whereId(this.sourceId).first() || new Source()
    },
  },
  methods: {
    async addConfigItem() {
      const formData = {
        ...this.formData,
      }
      this.adding = true
      const { status } = await this.$axios.post(
        `/source/${this.sourceId}/config_items`,
        formData,
        {
          params: {
            session: this.$store.state.session.sessionKey,
          },
        }
      )
      if (status === 200) {
        this.$toast.success('Added configuration item!')
      } else {
        this.$toast.error('Adding configuration item failed!')
      }
      this.adding = false
      this.$router.back()
    },
  },
}
</script>

<style scoped></style>
