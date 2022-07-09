<template>
    <div>
        <b-modal
            id="display-vuln-ticket-info-modal"
            centered
            size="xl"
            button-size="sm"
            title="Vulnerability Ticket Information"
            :hide-footer="true"
        >

            <b-list-group>
                <b-list-group-item>
                    <b>Vulnerability Name:</b>
                    <br/>
                    {{this.vuln_name}}
                </b-list-group-item>
                <b-list-group-item>
                    <b>Vulnerability Ticket Message:</b>
                    <br/>
                    {{this.vuln_details_message}}
                </b-list-group-item>
                <b-list-group-item>
                    <b>Patching Priority Level:</b>
                    <br/>
                    {{this.priority_level}}
                </b-list-group-item>
                <b-list-group-item>
                    <b>Patching Group:</b>
                    <br/>
                    {{this.patching_group}}
                </b-list-group-item>
                <b-list-group-item>
                    <b>List of Affected Systems:</b>
                    <b-button 
                        variant="outline-primary" 
                        class="list-download-button"
                        @click="download_list_affected_systems()"
                    >
                        <b-icon-download/>
                    </b-button>
                </b-list-group-item>
            </b-list-group>

            <!-- Display the button for closing the modal -->
            <div style="height: 20px;"/>
            <b-button variant="primary" block class="close-button" @click="close()">
                Close
            </b-button>
        </b-modal>
    </div>
</template>

<script>

export default {
  name: 'DisplayVulnTicketInfoModal',
  components: {
  },
  methods: {
      close: function close() {
        this.$bvModal.hide("display-vuln-ticket-info-modal");
      },
      download_list_affected_systems: function download_list_affected_systems() {
          console.log("DEBUG --> in the download_list_affected_systems() function");
      }
  },
  props: {
      vuln_name: String,
      vuln_details_message: String,
      priority_level: String,
      patching_group: String,
      csv_spreadsheet_path: String
  }
}
</script>
    
<style lang="scss">

/* Formats the button for closing the modal */
.close-button {
    width: 100%;
}

/* 
   Formats the button for downloading the .CSV file 
   of systems affected by the vulnerability 
*/
.list-download-button {
    margin-left: 20px
}

</style>