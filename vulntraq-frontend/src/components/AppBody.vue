<template>
  <div>
    <div class="body-holder" v-if="backend_is_up">
      <!-- The Ticket Information Pandel's Navigation Bar -->
      <b-navbar toggleable="lg" class="body-navbar">

        <!-- Left aligned nav items -->

        <!-- Ensures that the left aligned nav items do not immediately touch the left side of screen -->
        <div style="width: 10px;"/>

        <!-- Now displaying the left-hand button -->
        <b-button 
          v-if="vuln_ticket_list.length != 0"
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
      <div v-if="loading_vuln_ticket_information" class="ticket-information-body-info-section">
        <!-- We are loading vulnerability ticket information -->
        <div style="height: 20px;"/> <!-- Ensures that the information is a bit below the section's top border -->
        
        <div>
          <b-spinner variant="info"/>
          <h1>Loading Vulnerability Ticket Information....</h1>
        </div>
      </div>

      <div v-else-if="!loading_vuln_ticket_information && vuln_ticket_list.length == 0" 
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

export default {
  name: 'AppBody',
  components: {
    NewVulnModal
  },
  props: {
  },
  data() {
    return {
      vuln_ticket_list: [],
      loading_vuln_ticket_information: false,
    };
  },
  methods: {
      openReports: function openReports() {
          console.log("DEBUG: in openReports function");
      }
  },
  computed: {
      backend_is_up() {
        return store.state.backend_available;
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
  margin-left: 10%;
  margin-right: 10%;
  margin-top: 80px;
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