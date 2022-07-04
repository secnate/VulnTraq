<template>
    <div>
        <b-modal
            id="new-vuln-modal"
            centered
            size="xl"
            button-size="sm"
            title="Add A New Vulnerability Patching Ticket"
            :hide-footer="true"
            @hide="resetModal"
        >
            <b-form class="modal-form-section" @submit="handleSubmit" @reset="resetModal">

                <b-form-group
                    label="Vulnerability Name:" 
                    label-size="lg"
                >
                    <b-form-input 
                        size="sm"
                        v-model="form.patching_ticket_subject_line"
                        placeholder="Enter the vulnerability's name"
                        required
                    />
                </b-form-group>

                <b-form-group
                    label="Vulnerability Details:" 
                    label-size="lg"
                >
                    <b-form-textarea
                        placeholder="Enter information regarding the vulnerability's specifics..."
                        v-model="form.patching_ticket_message"
                        rows="4"
                        required
                    />
                </b-form-group>

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
                        v-model="form.patching_group"
                        :options="patching_group_names_list"
                        required
                        class="modal-form-items"
                    />
                </b-form-group>

                <!--
                    User Interface components for uploading *one* spreadsheet listing affected machines
                -->
                <div style="height: 10px;"/>
                <b-form-group 
                    label="Spreadsheets Listing Affected Machines:" 
                    label-size="lg"
                    description="(Only .csv and .xlsx files are accepted)"
                >
                    <b-form-file
                        v-model="form.affected_systems_file"
                        required
                        plain
                        accept=".csv, .xslx"
                    />
                </b-form-group>

                <!-- Display the button for submitting the form's information -->
                <div style="height: 20px;"/>
                <b-button type="submit" variant="primary" block class="submit-button">Submit</b-button>
            </b-form>

        </b-modal>
    </div>
</template>

<script>
import {checkIfContinuedBackendConnection} from '../backend-runup.js';
import store from '../store/store.js';
import * as types from '../store/mutationTypes.js';

export default {
  name: 'NewVulnModal',
  components: {
  },
  methods: {
      handleSubmit: function handleSubmit(event) {
          event.preventDefault(); // to prevent the screen from going temporarily white after the button is clicked
          
          // We need to perform a check regarding whether the backend is up or not
          // If it is not up, we obviously can't submit information regarding a new ticket
          checkIfContinuedBackendConnection();
          
          
          if (store.getters.get_backend_is_available) { 
              
            store.dispatch(types.SUBMIT_NEW_TICKET_INFORMATION, {
                patching_group_name: this.form.patching_group,
                patching_priority_level: this.form.patching_priority_level,
                patching_ticket_subject_line: this.form.patching_ticket_subject_line,
                patching_ticket_message: this.form.patching_ticket_message,
                affected_systems_file: this.form.affected_systems_file
            });

          }

          this.$bvModal.hide("new-vuln-modal");
      },
      resetModal: function resetModal() {
          // We are closing the vulnerability-ticket creating modal
          // Reseting this form's information fields so that the modal 
          // will be presented fresh and anew whenever it is (re)opened again
          this.form.patching_group = null;
          this.form.patching_priority_level = null;
          this.form.patching_ticket_subject_line = "";
          this.form.patching_ticket_message = "";
          this.form.affected_systems_file = null;
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
        patching_group: null,
        patching_priority_level: null,
        patching_ticket_subject_line: "",
        patching_ticket_message: "",
        affected_systems_file: null
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

/* Formats the button for submitting the new vulnerability information in the modal's form */
.submit-button {
    width: 100%;
}
</style>