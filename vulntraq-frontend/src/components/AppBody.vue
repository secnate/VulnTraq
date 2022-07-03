<template>
  <div>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <div class="body-holder" v-if="backend_is_up">
      <!-- The Ticket Information Pandel's Navigation Bar -->
      <b-navbar toggleable="lg" class="body-navbar">

        <!-- Left aligned nav items -->

        <!-- Ensures that the left aligned nav items do not immediately touch the left side of screen -->
        <div style="width: 10px;"/>

        <!-- Now displaying the left-hand button -->
        <b-button 
          v-if="vuln_ticket_list_length != 0"
          class="reports-button" v-on:click="openReports()" 
          style="background-color:transparent; border-color:transparent;"
        >
          Open Reports
        </b-button>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ms-auto">
          <b-button v-b-modal.new-vuln-modal class="addition-button"
                    v-b-tooltip.hover="'Address A New Vulnerability'" 
                    style="background-color:transparent; border-color: transparent;">
            <b-icon icon="plus-circle" aria-hidden="true" class="settings-button-icon"></b-icon> 
          </b-button>
        </b-navbar-nav>

        <!-- Ensures that the right aligned nav items do not immediately touch the right side of screen -->
        <div style="width: 10px;"/>
      </b-navbar>

      <!-- The Actual Ticket Information Being Displayed -->
      <div v-if="vuln_ticket_list_length == 0" 
        class="ticket-information-body-info-section">
        <div style="height: 20px;"/> <!-- Ensures that the information is a bit below the section's top border -->

        <!-- We loaded vulnerability ticket information and have nothing -->
        <h2>There Is No Vulnerability Ticket Information</h2>
        <h2>Click The ⊕ Button To Address A New Vulnerability!</h2>
      </div>

      <div v-else class="ticket-information-body-info-section">
        <div style="height: 20px;"/> <!-- Ensures that the information is a bit below the section's top border -->

        <!-- We loaded vulnerability ticket information and have some data for display -->
        <h2>WE LOADED DATA!</h2>
        <h2>THIS PORTION WILL BE DONE LATER<br/>WHEN LINKING TO BACKEND</h2>

        <!-- This is the actual table showing tickets -->
        <datatable
          title="All Vulnerability Tickets"
          :columns="ticket_table_columns"
          :rows="ticket_table_rows"
        ></datatable>
      </div>
    </div>
    <div class="body-holder" v-else>
      <div class="ticket-information-body-info-section">
        <div style="height: 20px;"/> <!-- Ensures that the information is a bit below the section's top border -->
        <b-icon icon="exclamation-triangle-fill" scale="3" variant="warning"/>
        <div style="height: 20px;"/> <!-- vertical padding offset -->
        <h2>Backend Is Currently Not Acessible At</h2>
        <h2>{{this.$backendURL}}</h2>
      </div>
    </div>
    <NewVulnModal/>
  </div>
</template>

<script>
import store from '../store/store.js';
import NewVulnModal from '@/components/NewVulnModal.vue'
import DataTable from "vue-materialize-datatable";

export default {
  name: 'AppBody',
  components: {
    NewVulnModal,
    "datatable": DataTable
  },
  props: {
  },
  methods: {
    openReports: function openReports() {
      console.log("DEBUG: in openReports function");
    },
    have_all_tick_info: function have_all_tick_info(id_to_examine) {
      //
      // Need to verify that we have all the information necessary for a ticket of specified id value 
      //
      // Need to see if the store's additional_ticket_properties_list has that data
      //
      // We have some items in the list of additional_ticket_properties
      // We cab start iterating to see if a given ticket of specified id has its information loaded
      var to_return = false;

      this.$store.state.additional_ticket_properties_list.forEach(ticket_obj => { 

        if (ticket_obj['id'] == id_to_examine) {
          to_return = true;
        }

      });

      return to_return;
    }
  },
  data : function() {
    return { 
      ticket_table_rows: [],
    }
  },
  computed: {
      backend_is_up() {
        return store.state.backend_available;
      },
      vuln_ticket_list_length() {
        return store.state.all_tickets_list.length;
      },
      ticket_table_columns() {
        return [
              {
                label: "Vulnerability Name",
                field: "vulnName",
                numeric: false,
                html: false
              },
              {
                label: "Status",
                field: "status",
                numeric: false,
                html: false
              }
              /*
              {
                label: "Priority",
                field: "priority",
                numeric: false,
                html: false
              },
              */
              /*
              {
                label: "Patching Group",
                field: "patchingGroup",
                numeric: false,
                html: false
              },
              {
                label: "Met Deadline?",
                field: "metDeadline",
                numeric: false,
                html: false
              }
              */
            ];
      }
  },
  watch: {
    // We have the additional_ticket_properties_list information updated... can we display another ticket?
    '$store.state.additional_ticket_properties_list': {
        immediate: true,
        handler() {

          this.$store.state.all_tickets_list.forEach(ticket_obj => {

            // Iterating over each ticket. Need to verify it not having been used previously
            if ( this.$store.state.displayed_table_ticket_ids.indexOf(ticket_obj["id"]) == -1 && this.have_all_tick_info(ticket_obj["id"]) ) {
              // It hasn't been used previously and we have *all* necessary information to load it into the table
              var new_ticket_row = {
                vulnName: ticket_obj["subject"],
                status: ticket_obj["status"]["description"]
              }
              //
              // Add the new row to the very top of the table
              // Logic is top rows generally contain newer 
              // information than the rows below
              //
              this.ticket_table_rows.unshift(new_ticket_row);

              this.$store.state.displayed_table_ticket_ids.push(ticket_obj["id"]);
            }

          });

        }
     }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

/* 
  The body-holder is the general element containing the 
  ticket related body panel and involved navigation bar
*/
.body-holder {
  margin-top: 50px;
  margin-left: 5px;
  margin-right: 5px;
  background-color: yellow;
}

/* 
  The body-navbar is the ticket related body panel's navigation bar
*/
.body-navbar {
  background-color: red;
  height: 50px;
  border-color: black;
  border-style: solid;
  border-radius: 5px;
}

/*
  The addition-button is the ticket related body panel's addition button.
  That addition button is used by the applicaiton's users to add information
  regarding newly discovered/ongoing vulnerabilities
*/
.addition-button {
  height: 35px;
}

/*
  The ticket-information-body-info-section is the section for the ticket related body
  panel that will hold informtion regarding the vulnerability ticket information either
  being loaded from the backend server for viewing in the frontend
*/
.ticket-information-body-info-section {
  width: 100%;
  text-align: center;
  align-items: center;
  justify-content: center;
  background-color: yellow;
  border: 2px solid black;
  border-radius: 5px;
}

</style>