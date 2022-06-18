<template>
    <div>
        <b-modal
            id="new-vuln-modal"
            centered
            button-size="sm"
            title="Add A New Vulnerability"
            ok-title="Submit"
            @ok="handleSubmitButtonClicked"
        >

            <b-form-group label="Patching Group:">
                <b-form-select
                    id="input-3"
                    v-model="form.patching_group_name"
                    :options="patching_group_names_list"
                    required
                />
            </b-form-group>

        </b-modal>
    </div>
</template>

<script>
import store from '../store/store.js';

export default {
  name: 'NewVulnModal',
  components: {
  },
  methods: {
      handleSubmitButtonClicked: function handleSubmitButtonClicked() {
          console.log("DEBUG: handling submit button clicked");
      }
  },
  computed: {
    patching_group_names_list() {
      return store.state.patching_group_names_list;
    }
  },
  data() {
    return {
      form: {
        patching_group_name: ""
      },
    }
  }
}
</script>
    
<style lang="scss">

</style>