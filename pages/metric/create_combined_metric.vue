<template>
  <b-card no-body class="mt-5">
    <b-card-header>
      <h3>
        <b-icon-diagram3 />
        {{ editing ? 'Edit' : 'Create' }} combined metric
      </h3>
    </b-card-header>
    <b-card-body>
      <b-row class="mb-1">
        <b-col>
          <b-form-group
            label="Combinator"
            label-cols="2"
            label-align="left"
            label-for="selectCombinator"
            class="mb-0"
          >
            <b-form-select
              id="selectCombinator"
              v-model="combinator"
              :state="!!combinator"
              :options="combinators"
              :disabled="editing"
              :value="null"
              required
              class="w-100"
            >
              <template #first>
                <b-form-select-option :value="null" disabled>
                  Choose...
                </b-form-select-option>
              </template>
            </b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mb-1">
        <b-col>
          <b-form-group
            label="Metric Name"
            label-cols="2"
            label-align="left"
            label-for="inputMetric"
            class="mb-0"
          >
            <b-form-input
              id="inputMetric"
              v-model="metric"
              :state="!!metric"
              :disabled="editing"
              value=""
              required
              class="w-100"
            >
            </b-form-input>
          </b-form-group>
        </b-col>
      </b-row>
    </b-card-body>
    <b-card-body>
      <b-row class="mt-3">
        <b-col>
          <h4>Metric expression</h4>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-list-group class="w-100">
            <combined-metric-node
              :expression="expression"
              @changeExpression="expression = $event"
            />
          </b-list-group>
        </b-col>
      </b-row>
    </b-card-body>
    <b-card-footer>
      <b-row class="mt-2">
        <b-col>
          <b-button
            :to="{
              name: 'metric-configure',
            }"
            variant="danger"
          >
            Cancel
          </b-button>
        </b-col>
        <b-col />
        <b-col>
          <b-button
            variant="primary"
            :disabled="saving || !readyToSave"
            class="float-right"
            @click="saveAll"
          >
            <b-spinner v-if="saving" class="ml-auto" small />
            Save combined metric
          </b-button>
        </b-col>
      </b-row>
    </b-card-footer>
  </b-card>
</template>

<script>
import Transformer from '~/models/Transformer'
import CombinedMetricNode from '~/components/CombinedMetricNode'

export default {
  components: { CombinedMetricNode },
  layout: 'nonfluid',
  asyncData({ params }) {
    return {
      expression: params.expression || null,
      editing: !!params.combinator && !!params.metric,
      combinator: params.combinator || null,
      metric: params.metric || '',
      configHash: params.configHash || null,
      saving: false,
    }
  },
  computed: {
    readyToSave() {
      return !!this.combinator && !!this.expression && this.metric !== ''
    },
    combinators() {
      return Transformer.query()
        .where('isCombinator', true)
        .all()
        .map((transformer) => transformer.id)
    },
  },
  async mounted() {
    Transformer.commit((state) => {
      state.fetching = true
    })
    await Transformer.api()
      .get('/transformers')
      .finally(() => {
        Transformer.commit((state) => {
          state.fetching = false
        })
      })
  },
  methods: {
    async saveAll() {
      this.saving = true
      try {
        if (this.editing) {
          await this.$axios.patch(
            `/transformer/${this.combinator}/${this.metric}`,
            {
              expression: this.expression,
              configHash: this.configHash,
            }
          )
          this.askForReconfigure()
        } else {
          await this.$axios.put(
            `/transformer/${this.combinator}/${this.metric}`,
            {
              expression: this.expression,
            }
          )
          this.askForReconfigure()
        }
      } catch (error) {
        this.$toast.error(`Saving combined metric failed!`)
      }
      this.saving = false
    },
    askForReconfigure() {
      this.$bvModal
        .msgBoxConfirm(
          `Reconfigure following combinator?\n${this.combinator}`,
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
        .then((value) => {
          if (value) {
            Transformer.api().reconfigureById(this.combinator)
          }
        })
    },
  },
}
</script>

<style scoped>
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
</style>
