<template>
    <div>
        <b-navbar toggleable="lg" class="header-navbar">
            <img src="../assets/logo.png" class="logo-img"/>
            <h1 class="logo-text">
                VulnTraq
            </h1>

            <!-- Right aligned nav items -->
            <b-navbar-nav class="ms-auto">

                <!-- The Refresh button will be used for re-querying the backend for updated info -->
                <b-button class="refresh-button" 
                    v-b-tooltip.hover.leftbottom="'Get Updated Data From The Ticketing System'" 
                    v-on:click="refreshData()"
                    id="refresh-button" style="background-color:transparent; border-color: transparent;">
                    <b-icon icon="arrow-clockwise" aria-hidden="true"></b-icon> 
                </b-button>

            </b-navbar-nav>

            <!-- Ensures that the right aligned nav items do not immediately touch right side of screen -->
            <div style="width: 20px;"/>
            
        </b-navbar>

        <b-modal id="modal-1" title="BootstrapVue">
            <p class="my-4">Hello from modal!</p>
        </b-modal>
    </div>
</template>

<script>

export default {
  name: 'AppHeader',
  components: {
  },
  methods: {
      openSettings: function openSettings() {
          console.log("DEBUG: in open settings function");
      },
      refreshData: function refreshData() {
          console.log("DEBUG: in refresh data function");
      }
  }
}

</script>
    
<style lang="scss">

// Styles the navigation bar
.header-navbar {
    height: 60px;
    background-color: purple;
}

// Styles the logo image appearing in the navigation bar
.logo-img {
    height: 30px;
    width: 30px;
    margin-left: 20px;
    vertical-align: center;
}

// Styles the "VulnTraq" logo text appearing in the navigation bar
.logo-text {
    font-family: "Arial Narrow";
    padding-left: 20px;
    color: white;
}

// Styles the settings button
.settings-button {
    margin-right: 20px;
}

</style>