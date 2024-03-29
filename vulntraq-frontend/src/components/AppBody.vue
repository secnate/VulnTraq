<template>
  <div>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <!-- Alert to be displayed if there are no tickets for a selected ticket-filtering priority -->
    <b-alert
      :show="dismissCountDown"
      dismissible
      variant="warning"
      @dismissed="dismissCountDown=0"
      @dismiss-count-down="countDownChanged"
    >
      There are no vulnerability tickets for the selected "{{ selected_filtering_options }}" criticality. You are welcome to create the first :-)
      <br/>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This alert will close after {{ dismissCountDown }} seconds...
    </b-alert>

    <!-- Start of the body to be displayed -->
    <div class="body-holder" v-if="backend_is_up">
      <!-- The Ticket Information Panel's Navigation Bar -->
      <b-navbar toggleable="lg" class="body-navbar">

        <!-- Left aligned nav items -->

        <!-- Ensures that the left aligned nav items do not immediately touch the left side of screen -->
        <div style="width: 10px;"/>

        <!-- Now displaying the left-hand button -->
        <b-button 
          v-if="vuln_ticket_list_length != 0 && table_can_be_displayed"
          class="reports-button" v-on:click="openReports()" 
          style="background-color:transparent; border-color:transparent;"
        >
          Open Reports
        </b-button>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ms-auto">
          <b-button 
            v-b-modal.new-vuln-modal class="addition-button"
            v-b-tooltip.hover="'Address A New Vulnerability'" 
            style="background-color:transparent; border-color: transparent;"
          >
            <b-icon icon="plus-circle" aria-hidden="true" class="settings-button-icon"></b-icon> 
          </b-button>
        </b-navbar-nav>

        <!-- Ensures that the right aligned nav items do not immediately touch the right side of screen -->
        <div style="width: 10px;"/>
      </b-navbar>

      <!-- Vertical Padding Separating The Ticket Information Panel's Navigation Bar From Actual Ticket Info -->
      <div style="height: 2px;"/>

      <!-- The Actual Ticket Information Being Displayed -->
      <div v-if="vuln_ticket_list_length == 0 && !table_can_be_displayed" 
        class="ticket-information-body-info-section">
        <div style="height: 20px;"/> <!-- Ensures that the information is a bit below the section's top border -->

        <!-- We loaded vulnerability ticket information and have nothing -->
        <h2>There Is No Vulnerability Ticket Information</h2>
        <h2>Click The ⊕ Button To Address A New Vulnerability!</h2>
      </div>

      <div v-else class="ticket-information-body-info-section">
        <div style="height: 20px;"/> <!-- Ensures that the information is a bit below the section's top border -->
        
        <!-- We loaded vulnerability ticket information and have some data for display -->
        <div v-if="currently_adding_new_ticket">
          <b-spinner style="width: 3rem; height: 3rem;"/>
          <h2>Creating The New Ticket...</h2>
        </div>

        <div v-if="!table_can_be_displayed">
          <h2 v-if="!currently_adding_new_ticket">Loading All Vulnerability Tickets' Data....</h2>
          <b-progress 
            :value="number_of_currently_completely_loaded_tickets" 
            :max="number_of_all_tickets_to_be_displayed" 
            height="2rem"
            show-progress animated
          />
        </div>

        <!-- This is the actual table showing tickets -->
        <!-- Buttons used to determine the tickets that are to be displayed by selected criticalities -->
        <div v-if="table_can_be_displayed">

          <!-- Disply the filtering options prompt and selector on the same row -->
          <div class="flex">

            <div style="width: 20px;"/>
            <h4> Patching Criticality of Displayed Tickets: </h4>
            <div style="width: 10px;"/>
            <b-form-select 
              v-model="selected_filtering_options" 
              :options="vuln_ticket_filtering_options"
              v-on:change="updated_tickets_displayed_by_criticality()"
            />
          </div>

          <datatable
            :title="'Vulnerability Tickets'"
            :columns="ticket_table_columns"
            :rows="filtered_ticket_table_rows"
            :printable="false"
            :defaultPerPage="20"
            :exportable="false"
            :sortable="false"
            v-on:row-click="onRowClick"
            v-if="table_can_be_displayed"
          ></datatable>
        </div>
      </div>
    </div>

    <div class="body-holder" v-else>
      <div class="ticket-information-body-info-section">
        <div style="height: 20px;"/> <!-- Ensures that the information is a bit below the section's top border -->
        <b-icon icon="exclamation-triangle-fill" scale="3" variant="dark"/>
        <div style="height: 20px;"/> <!-- vertical padding offset -->
        <h2>Backend Currently Not Acessible At</h2>
        <h2>{{this.$backendURL}}</h2>
      </div>
    </div>

    <!-- Information about modals to be presented from this screen! -->
    <NewVulnModal/>
    <DisplayVulnTicketInfoModal
      :vuln_name="clicked_ticket_vuln_name"
      :vuln_details_message="selected_row_message"
      :priority_level="clicked_ticket_priority_level"
      :patching_group="clicked_ticket_patching_group"
      :csv_spreadsheet_id="selected_row_csv_id"
      :day_ticket_created="clicked_ticket_day_ticket_created"
      :day_ticket_closed="clicked_ticket_day_ticket_closed"
      :day_ticket_due="clicked_ticket_day_ticket_due"
      :past_deadline="clicked_ticket_past_deadline"
    />
    <TicketStatsReportModal
      :all_ticket_rows_data="all_possible_ticket_table_rows"
    />
    
  </div>
</template>

<script>
import store from '../store/store.js';
import NewVulnModal from '@/components/NewVulnModal.vue'
import DataTable from "vue-materialize-datatable";
import DisplayVulnTicketInfoModal from '@/components/DisplayVulnTicketInfoModal.vue'
import TicketStatsReportModal from '@/components/TicketStatsReportModal.vue'

export default {
  name: 'AppBody',
  components: {
    NewVulnModal,
    "datatable": DataTable,
    DisplayVulnTicketInfoModal,
    TicketStatsReportModal
  },
  props: {
  },
  methods: {
    openReports: function openReports() {
      this.$bvModal.show("ticket-stats-report-modal");
    },
    updated_tickets_displayed_by_criticality() {
      //
      // Called when users change the criticality of the tickets to be displayed in the table
      //
      // the null value for the selected_filtering_options represents *all* possible criticalities
      if (this.selected_filtering_options == null) {
        this.filtered_ticket_table_rows = this.all_possible_ticket_table_rows;
        return;
      }
      //
      // Otherwise, we have a specific criticality we need to filter on
      this.filtered_ticket_table_rows = [];
      //
      for (var i = 0; i < this.all_possible_ticket_table_rows.length; i++) {
        if (this.all_possible_ticket_table_rows[i].priority == this.selected_filtering_options) {
          this.filtered_ticket_table_rows.unshift(this.all_possible_ticket_table_rows[i]);
        }
      }
      //
      this.filtered_ticket_table_rows.sort(this.compare_ticket_objects);
      //
      // Now need to check if we have *no* tickets displayed for this 
      // particular criticality -- and notify the user if so
      if (this.filtered_ticket_table_rows.length == 0 && this.all_possible_ticket_table_rows.length != 0) {
        // We *have* some tickets for display... but not of this specific criticality
        this.showAlert();
      }
    },
    get_additional_ticket_info: function get_additional_ticket_info(id_to_examine) {
      //
      // Need to get the additional ticket information for a ticket of specified id value
      //
      var to_return = null;

      this.$store.state.additional_ticket_properties_list.forEach(ticket_obj => { 

        if (ticket_obj['id'] == id_to_examine) {
          to_return = ticket_obj;
        }

      });

      return to_return;
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
    },
    // Function for comparing ticket objects in terms of their order of creation (represented by ticket ids)
    // The function is used in ordering tickets in the ticket-displaying table 
    // with the most recent ticket [of highest ticket id value] being at the top
    // and the oldest ticket [of lowest ticket id value] being at the bottom
    compare_ticket_objects: function compare_ticket_objects(a, b) {
      if (a.ticket_id > b.ticket_id) {
        return -1;
      }
      else if (a.ticket_id < b.ticket_id) {
        return 1;     
      }
      else {
        return 0;
      }
    },
    onRowClick: function (row) {
      // We clicked a row in our table of tickets
      this.currently_selected_row = row;
      this.update_clicked_ticket_vuln_details_message();
      this.update_clicked_ticket_csv_spreadsheet_id();
      this.$bvModal.show("display-vuln-ticket-info-modal");
    },
    update_clicked_ticket_vuln_details_message() {
      
      if (this.currently_selected_row == null) {
        this.selected_row_message = "";
        return;
      }

      // We need to find the actual ticket in the Vue.JS application's store and extract the message
      for (var i = 0; i < this.$store.state.additional_ticket_properties_list.length; i++) {

        if (this.$store.state.additional_ticket_properties_list[i]["id"] == this.currently_selected_row["ticket_id"]) {
          this.selected_row_message = this.$store.state.additional_ticket_properties_list[i]["message"];
          return;
        }
      }
      //
      // Welp, something went wrong!
      this.selected_row_message = "DEFAULT EMPTY MESSAGE THAT SHOULD NOT BE HERE";
    },
    update_clicked_ticket_csv_spreadsheet_id() {

      if (this.currently_selected_row == null) {
        this.selected_row_csv_id = "-1";
        return;
      }

      // We need to find the actual ticket in the Vue.JS application's store and extract the message
      for (var i = 0; i < this.$store.state.additional_ticket_properties_list.length; i++) {

        if (this.$store.state.additional_ticket_properties_list[i]["id"] == this.currently_selected_row["ticket_id"]) {
          this.selected_row_csv_id = this.$store.state.additional_ticket_properties_list[i]["attachment_id"].toString();
          return;
        }
      }
      //
      // Welp, something went wrong!
      this.selected_row_csv_id = "-1";
    },
    //
    /////////////////////////////////////////////////////////////////////////////
    // Functions for controlling the alert that is to be 
    // displayed if there are no tickets of the specified criticality
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    showAlert() {
      this.dismissCountDown = this.dismissSecs
    }
  },
  data : function() {
    return { 
      filtered_ticket_table_rows: [],      // they are displayed based on selected criticality
      all_possible_ticket_table_rows: [],
      //
      // Data information needed to have a modal containing 
      // vuln-ticket info be displayed when clicking row
      currently_selected_row: null,
      selected_row_message: "",
      selected_row_csv_id: "",
      selected_filtering_options: null,
      //
      // Variables for controlling the alert that is to be 
      // displayed if there are no tickets of the selected criticality
      dismissSecs: 30,
      dismissCountDown: 0
    }
  },
  computed: {
      backend_is_up() {
        return store.state.backend_available;
      },
      vuln_ticket_filtering_options() {
        return this.$store.state.ticket_filtering_priority_names_list;
      },
      vuln_ticket_list_length() {
        return store.state.all_tickets_list.length;
      },
      number_of_all_tickets_to_be_displayed() {
        return this.$store.state.all_tickets_list.length;
      },
      number_of_currently_completely_loaded_tickets() {
        return this.$store.state.displayed_table_ticket_ids.length;
      },
      table_can_be_displayed() {
        // Displaying the table if we have a non-zero number of *all* rows' information definitively loaded *or* we are creating a new ticket
        return ((this.$store.state.all_tickets_list.length <= this.$store.state.displayed_table_ticket_ids.length) && (this.$store.state.all_tickets_list.length > 0))
                || (this.$store.state.ticket_addition_underway);
      },
      currently_adding_new_ticket() {
        return this.$store.state.ticket_addition_underway;
      },
      ticket_table_columns() {
        return [
            {
                label: "Ticket ID",
                field: "ticket_id",
                numeric: true,
                html: false
              },
              {
                label: "Vulnerability Name",
                field: "vulnName",
                numeric: false,
                html: false,
              },
              {
                label: "Status",
                field: "status",
                numeric: false,
                html: false
              },
              {
                label: "Patching Group",
                field: "patching_group",
                numeric: false,
                html: false
              },
              {
                label: "Priority",
                field: "priority",
                numeric: false,
                html: false
              },
              {
                label: "Day Ticket Created",
                field: "day_ticket_created",
                numeric: false,
                html: false
              },
              {
                label: "Due Date",
                field: "ticket_due_date",
                numeric: false,
                html: false
              },
              {
                label: "Day Closed",
                field: "ticket_closing_date",
                numeric: false,
                html: false
              },
              {
                label: "Past Deadline?",
                field: "past_deadline",
                numeric: false,
                html: false
              }
            ];
      },
      ////////////////////////////////////////////////////////////////////////////////////
      //
      // Computed properties depending on the value of the clicked row and involved vuln 
      clicked_ticket_vuln_name() {
        return (this.currently_selected_row == null ? "" : this.currently_selected_row.vulnName);
      },
      clicked_ticket_priority_level() {
        return (this.currently_selected_row == null ? "" : this.currently_selected_row.priority);
      },
      clicked_ticket_patching_group() {
        return (this.currently_selected_row == null ? "" : this.currently_selected_row.patching_group);
      },
      clicked_ticket_day_ticket_created() {
        return (this.currently_selected_row == null ? "" : this.currently_selected_row.day_ticket_created);
      },
      clicked_ticket_day_ticket_due() {
        return (this.currently_selected_row == null ? "" : this.currently_selected_row.ticket_due_date);
      },
      clicked_ticket_day_ticket_closed() {
        return (this.currently_selected_row == null ? "" : this.currently_selected_row.ticket_closing_date);
      },
      clicked_ticket_past_deadline() {
        return (this.currently_selected_row == null ? "" : this.currently_selected_row.past_deadline);
      }
      //
      ////////////////////////////////////////////////////////////////////////////////////
  },
  watch: {
    // We have the additional_ticket_properties_list information updated... can we display another ticket?
    '$store.state.additional_ticket_properties_list': {
        immediate: true,
        handler() {

          if (this.$store.state.all_tickets_list.length < this.all_possible_ticket_table_rows.length) {
            // Some tickets got deleted from the backend UVDesk server
            // Because we have less tickets than originally, we need to do a house cleaning
            this.all_possible_ticket_table_rows = [];
          }

          this.$store.state.all_tickets_list.forEach(ticket_obj => {

            // Iterating over each ticket. Need to verify it not having been used previously
            var additional_information_for_ticket_obj = this.get_additional_ticket_info(ticket_obj["id"]);

            if ( this.$store.state.displayed_table_ticket_ids.indexOf(ticket_obj["id"]) == -1 && additional_information_for_ticket_obj != null ) {
              //
              // It hasn't been used previously and we have *all* necessary information to load it into the table
              //
              var new_ticket_row = {
                ticket_id: ticket_obj["id"],
                vulnName: ticket_obj["subject"],
                status: ticket_obj["status"]["description"],
                patching_group: additional_information_for_ticket_obj["patching_group"],
                priority: additional_information_for_ticket_obj["priority_level"],

                day_ticket_created: additional_information_for_ticket_obj["day_ticket_created"].toDateString(),
                day_ticket_created_datetime_object: additional_information_for_ticket_obj["day_ticket_created"],

                ticket_due_date: additional_information_for_ticket_obj["ticket_due_date"].toDateString(),
                ticket_due_date_datetime_object: additional_information_for_ticket_obj["ticket_due_date"],

                ticket_closing_date: additional_information_for_ticket_obj["ticket_closing_date"],
                ticket_closing_date_datetime_obj: additional_information_for_ticket_obj["ticket_closing_date_datetime_obj"],

                past_deadline: (additional_information_for_ticket_obj["is_past_deadline"] ? "Yes" : "No")
              }
              //
              // Add the new row to the very top of the table
              // Logic is top rows generally contain newer 
              // information than the rows below
              //
              this.all_possible_ticket_table_rows.unshift(new_ticket_row);
              //
              // We want to sort the ticket objects in the this.all_possible_ticket_table_rows
              // so that they by default have the most recent ticket 
              // (with the highest id value) towards the top
              this.all_possible_ticket_table_rows.sort(this.compare_ticket_objects);
              //
              // OK we added the ticket. Updating the record of used ticket ids appropriately
              this.$store.state.displayed_table_ticket_ids.push(ticket_obj["id"]);
              //
              // Now need to check if it has the desired criticality & we can actually add it to the filtered rows right now 
              if (this.selected_filtering_options == null || this.selected_filtering_options == new_ticket_row.priority) {

                this.filtered_ticket_table_rows.unshift(new_ticket_row);
                this.filtered_ticket_table_rows.sort(this.compare_ticket_objects);
              }
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
  border: 2px solid black;
  border-radius: 5px;
  background-color: #ffbb33;
}

.ticket-criticalities-options-buttons {
  width: 100%;
  background-color: #ffe6e6;
}

.flex {
  display: flex;
}

</style>