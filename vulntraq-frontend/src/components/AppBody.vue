<template>
  <div class="body-holder">
    <b-navbar toggleable="lg" class="body-navbar">

      <!-- Left aligned nav items -->
      <!-- Ensures that the left aligned nav items do not immediately touch the left side of screen -->
      <div style="width: 10px;"/>
      <b-button class="reports-button" v-on:click="openReports()" style="background-color:transparent; border-color:transparent;">
        Open Reports
      </b-button>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ms-auto">
        <b-button v-b-modal.modal-1 class="addition-button"
                  v-b-tooltip.hover="'Create A New Vulnerability Ticket'" 
                  style="background-color:transparent; border-color: transparent;">
          <b-icon icon="plus-circle" aria-hidden="true" class="settings-button-icon"></b-icon> 
        </b-button>
      </b-navbar-nav>

      <!-- Ensures that the right aligned nav items do not immediately touch the right side of screen -->
      <div style="width: 10px;"/>
    </b-navbar>
  </div>
</template>

<script>
export default {
  name: 'AppBody',
  props: {
  },
  data() {
    return {
      vuln_ticket_list: []
    };
  },
  methods: {
      openReports: function openReports() {
          console.log("DEBUG: in openReports function");
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.body-holder {
  margin-left: 10%;
  margin-right: 10%;
  margin-top: 80px;
  background-color: yellow;
}

.body-navbar {
  background-color: red;
  height: 45px;
  border-color: black;
  border-style: solid;
  border-radius: 5px;
}

.addition-button {
  height: 35px;
}

</style>
