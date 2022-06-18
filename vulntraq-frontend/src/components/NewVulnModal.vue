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
                    v-model="form.patching_group"
                    :options="foods"
                    required
                />
            </b-form-group>

        </b-modal>
    </div>
</template>

<script>
// import store from '../store/store.js';

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
  },
  data() {
      return {
          form: {
            patching_group: ""
          },
          foods: [{ text: 'Select One', value: null }, 'Carrots', 'Beans', 'Tomatoes', 'Corn']
      }
    }
}
</script>
    
<style lang="scss">

</style>