<template>
  <div>
    <b-row>
      <b-col>
        <h1>Create combined metric</h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-list-group class="w-100">
          <b-list-group-item class="flex-column align-items-start">
            <div>
              <b-link v-b-toggle.my-collapse>
                <span class="when-opened">
                  <b-icon-triangle-fill flip-v />
                </span>
                <span class="when-closed">
                  <b-icon-triangle-fill rotate="90" />
                </span>
              </b-link>
              Sum node
              <span class="float-right mb-1">
                <b-icon-pencil scale="1.5" />
              </span>
            </div>
            <b-collapse id="my-collapse" class="w-100" visible>
              <b-list-group class="w-100">
                <b-list-group-item class="flex-column align-items-start">
                  <div>
                    foo.bar.power
                    <span class="float-right mb-1">
                      <b-icon-pencil scale="1.5" />
                      <b-icon-trash scale="1.5" />
                    </span>
                  </div>
                </b-list-group-item>
                <b-list-group-item class="flex-column align-items-start">
                  1,00
                  <span class="float-right mb-1">
                    <b-button size="sm" variant="outline-secondary">
                      <b-icon-pencil scale="1.5" />
                    </b-button>
                    <b-button variant="outline-danger" size="sm">
                      <b-icon-trash scale="1.5" />
                    </b-button>
                  </span>
                </b-list-group-item>
                <b-list-group-item class="flex-column align-items-start">
                  <div>
                    <b-link v-b-toggle.my-collapse2>
                      <span class="when-opened">
                        <b-icon-triangle-fill flip-v />
                      </span>
                      <span class="when-closed">
                        <b-icon-triangle-fill rotate="90" />
                      </span>
                    </b-link>
                    throttle (1s)
                    <span class="float-right mb-1">
                      <b-link>
                        <b-icon-pencil scale="1.5" />
                      </b-link>
                      <b-link>
                        <b-icon-trash scale="1.5" />
                      </b-link>
                    </span>
                  </div>
                  <b-collapse id="my-collapse2" class="w-100">
                    <b-list-group class="w-100">
                      <b-list-group-item class="flex-column align-items-start">
                        foo.baz.highrate.power
                        <span class="float-right mb-1">
                          <b-icon-pencil scale="1.5" />
                        </span>
                      </b-list-group-item>
                    </b-list-group>
                  </b-collapse>
                </b-list-group-item>
                <b-list-group-item class="flex-column align-items-start">
                  <b-link v-b-toggle.my-collapse3>
                    <span class="when-opened">
                      <b-icon-triangle-fill flip-v />
                    </span>
                    <span class="when-closed">
                      <b-icon-triangle-fill rotate="90" />
                    </span>
                  </b-link>
                  Mul
                  <span class="float-right mb-1">
                    <b-button size="sm">
                      <b-icon-pencil scale="1.5" />
                    </b-button>
                    <b-button variant="danger" size="sm">
                      <b-icon-trash scale="1.5" />
                    </b-button>
                  </span>
                  <b-collapse id="my-collapse3" class="w-100" visible>
                    <b-list-group class="w-100">
                      <b-list-group-item class="flex-column align-items-start">
                        foo.egg.voltage
                        <span class="float-right mb-1">
                          <b-link>
                            <b-icon-pencil scale="1.5" />
                          </b-link>
                        </span>
                      </b-list-group-item>
                      <b-list-group-item class="flex-column align-items-start">
                        <b-link v-b-toggle.my-collapse4>
                          <span class="when-opened">
                            <b-icon-triangle-fill flip-v />
                          </span>
                          <span class="when-closed">
                            <b-icon-triangle-fill rotate="90" />
                          </span>
                        </b-link>
                        Add
                        <span class="float-right mb-1">
                          <b-button size="sm">
                            <b-icon-pencil scale="1.5" />
                          </b-button>
                          <b-button variant="danger" size="sm">
                            <b-icon-trash scale="1.5" />
                          </b-button>
                        </span>
                        <b-collapse id="my-collapse4" class="w-100" visible>
                          <b-list-group class="w-100">
                            <b-list-group-item
                              class="flex-column align-items-start"
                            >
                              foo.egg.A.current
                              <span class="float-right mb-1">
                                <b-link>
                                  <b-icon-pencil scale="1.5" />
                                </b-link>
                              </span>
                            </b-list-group-item>
                            <b-list-group-item
                              class="flex-column align-items-start"
                            >
                              <em class="text-muted">empty</em>
                              <span class="float-right mb-1">
                                <b-link>
                                  <b-icon-pencil scale="1.5" />
                                </b-link>
                              </span>
                            </b-list-group-item>
                          </b-list-group>
                        </b-collapse>
                      </b-list-group-item>
                    </b-list-group>
                  </b-collapse>
                </b-list-group-item>
              </b-list-group>
              <div>
                <span class="float-right mt-1">
                  <b-icon-plus scale="2" />
                </span>
              </div>
            </b-collapse>
          </b-list-group-item>
        </b-list-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {}
</script>

<style scoped>
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
</style>
