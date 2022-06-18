<template>
    <div>
        <b-modal
            id="new-vuln-modal"
            centered
            size="xl"
            button-size="sm"
            title="Add A New Vulnerability"
            ok-title="Submit"
            @show="resetModal"
            @hidden="resetModal"
            @ok="handleSubmit"
        >
            <b-form class="modal-form-section">

                <b-form-group 
                    label="Priority Level:" 
                    label-size="lg"
                >
                    <b-form-select
                        id="input-3"
                        v-model="form.patching_priority_level"
                        :options="ticket_patching_priority_levels"
                        required
                        class="modal-form-items"
                    />
                </b-form-group>

                <!-- 
                    The patching group for a newly created vuln specifies the type of system to be patched 
                    and directs the ticket to proper IT admins ("agents" in UVDesk's parlance)
                -->
                <b-form-group 
                    label="Patching Group:" 
                    label-size="lg"
                    description="If the desired group for a system to be patched does not exist, please contact the ticketing system's administrators to request it be created."
                >
                    <b-form-select
                        id="input-3"
                        v-model="form.patching_group_name"
                        :options="patching_group_names_list"
                        required
                        class="modal-form-items"
                    />
                </b-form-group>
            </b-form>

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
      handleSubmit: function handleSubmit() {
          console.log("DEBUG: handling submit button clicked --> this functionality is to be done");
      },
      resetModal: function resetModal() {
          console.log("DEBUG: resetting the modal --> this functionality is to be done");
          this.form.patching_group_name = "";
          this.form.patching_priority_level = "";
      }
  },
  computed: {
    patching_group_names_list() {
      return store.state.patching_group_names_list;
    },
    ticket_patching_priority_levels() {
      return store.state.ticket_patching_priority_names_list;
    }
  },
  data() {
    return {
      form: {
        patching_group_name: "",
        patching_priority_level: ""
      },
    }
  }
}
</script>
    
<style lang="scss">

/* This formats the general section where the modal's form is located */
.modal-form-section {
    margin-left: 20px;
    margin-right: 20px;
}

/* Formats the individual items stored within the modal's form */
.modal-form-items {
    width: 100%;
}

</style>