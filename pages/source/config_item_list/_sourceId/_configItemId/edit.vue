<template>
  <div>
    <b-row>
      <b-col>
        <h1>Source {{ sourceId }}: Edit {{ source.configItemName }}</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <FormGenerator v-model="formData" :schema="schema">
          <template v-slot:actions>
            <b-button
              class="mt-1"
              :to="{
                name: 'source-config_item_list-sourceId',
                params: {
                  sourceId: sourceId
                }
              }"
              variant="danger"
            >
              Cancel
            </b-button>
            <b-button
              :disabled="updating"
              variant="primary"
              class="mt-1 float-right"
              @click="addConfigItem()"
            >
              <b-spinner v-if="updating" class="ml-auto" small />
              Update {{ source.configItemName }}
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
  async asyncData({ $axios, params }) {
    const { data: schema } = await $axios.get(
      `/source/${params.sourceId}/config_item/${encodeURIComponent(
        params.configItemId
      )}/input_form`
    )
    const { data: formData } = await $axios.get(
      `/source/${params.sourceId}/config_item/${encodeURIComponent(
        params.configItemId
      )}`
    )
    return {
      sourceId: params.sourceId,
      schema,
      formData,
      updating: false
    }
  },
  computed: {
    source() {
      return (
        Source.query()
          .whereId(this.sourceId)
          .first() || new Source()
      )
    }
  },
  methods: {
    async addConfigItem() {
      const formData = {
        ...this.formData
      }
      console.log(formData)
      this.updating = true
      const { status } = await this.$axios.post(
        `/source/${this.sourceId}/config_item/${encodeURIComponent(
          this.$route.params.configItemId
        )}`,
        formData
      )
      if (status === 200) {
        this.$toast.success('Updated configuration item!')
      } else {
        this.$toast.error('Updating configuration item failed!')
      }
      this.updating = false
      this.$router.back()
    }
  }
}
</script>

<style scoped></style>
