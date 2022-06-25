// store.js
// Uses Vuex to store the frontend application's data across all components
import axios from "axios";
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// Helper function used to sort two objects with "id" property in ascending order
function sort_by_id() {
    return function (elem1, elem2) {
      if (elem1.id > elem2.id) {
        return 1;
      } else if (elem1.id < elem2.id) {
        return -1;
      } else {
        return 0;
      }
    };
  }

export default new Vuex.Store({
    state: {
        // The backend_available indicates whether the frontend can reach
        // out to the backend server for data successfully. 
        //
        // Since we are not going to assume that the backend is up without
        // proper verification, the default value will be false
        backend_available: false,
        //
        // List of *all* tickets stored in the backend and their information
        all_tickets_list: [], // By default, we don't have any
        //
        // List of all the ticket-handling agents -- i.e. IT staff
        ticket_handling_agents_list: [], 
        //
        // List of ticket status options
        ticket_status_options_list: [],
        //
        // List of ticket patching groups
        patching_group_list: [],
        patching_group_names_list: [],
        //
        // List of ticket patching priority types
        // Patching priorities can also be colloquially referred to as "criticalities"
        ticket_patching_priority_types_list: [],
        ticket_patching_priority_names_list: [],
        //
        // Default information for creating a new vulnerability ticket
        new_patching_ticket_customer_name: "VulnTraq Application",
        new_patching_ticket_customer_email: "vulntraqappemail@gmail.com"
    },
    mutations: {
        set_backend_is_available(state) {
            state.backend_available = true
            return state.backend_available
        },
        set_backend_not_available(state) {
            state.backend_available = false

            return state.backend_available
        },
        get_ticket_info_from_backend(state) {
            // This function configures the application's data using retrieved
            // ticketing-related information from the backend
            new Promise((resolve, reject) => {
                // Check if backend is online & accessible
                axios({
                url: "/api/v1/tickets/",
                method: "GET",
                })
                .then((resp) => {
                    // Creating test stuff
                    state.all_tickets_list = resp.data["tickets"];
                    //
                    // List of all the ticket-handling agents -- i.e. IT staff
                    state.ticket_handling_agents_list = resp.data["agents"];
                    //
                    // List of ticket status options
                    state.ticket_status_options_list = resp.data["status"];
                    //
                    // List of ticket patching groups
                    state.patching_group_list = resp.data["group"];
                    state.patching_group_names_list = [{ text: 'Select One', value: null}];
                    //
                    var i = 0; // loop iterator variable that can be reused in multiple for loops 
                    //
                    for (i = 0; i < state.patching_group_list.length; i++) {
                        state.patching_group_names_list.push({
                            text: state.patching_group_list[i]["name"],
                            value: state.patching_group_list[i]["id"]
                        });
                    }
                    //
                    // List of ticket patching priority types
                    // Patching priorities can also be colloquially referred to as "criticalities"
                    //
                    // First we get the data for the different available types of patching priorities.
                    // The priority-related types objects are sorted with their "id" property in ascending order.
                    // This is because the oldest data objects have the lowest "id" property value and vice-versa.
                    // Thus, creating the priority related types in the order of most urgent to least ensures that the most
                    // urgent patching related priority type appears first in the array and the least urgent appears last
                    //
                    // The sorting in turn deliberately affects the order of priority-related options shown in the user interface...
                    state.ticket_patching_priority_types_list = resp.data["type"].sort(sort_by_id());
                    state.ticket_patching_priority_names_list = [{ text: 'Select One', value: null}];
                    for (i = 0; i < state.ticket_patching_priority_types_list.length; i++) {
                        // We are now extracting the options for the different levels of ticket patching priorities
                        // Notice that the ticket patching priorities in the UVDesk backend server are of the format
                        //
                        //      "High Patch -- 10 Days"
                        //
                        // following the descriptor text format of "<PRIORITY LEVEL> Patch -- <TIME PERIOD FOR PATCHING>"
                        //
                        // While the descriptor text will follow that format for users to read and select from, the process
                        // of new vulnerability ticket creation will involve specifying the *specific* priority level necessary.
                        // Thus, specific priority values need to be retrieved from the descriptor string and saved for future use
                        state.ticket_patching_priority_names_list.push({
                            text: state.ticket_patching_priority_types_list[i]["name"],
                            value: state.ticket_patching_priority_types_list[i]["name"].split(" ")[0]
                        });
                    }
                    //
                    console.log("Retrieved ticket-related info from backend");
                    resolve(resp);
                })
                .catch((err) => {
                    console.log("Failed to retrieve ticket-related info from backend");
                    reject(err);
                });
            });
        },
        clear_all_ticket_related_information(state) {
            // This is invoked when the frontend can't communicate with the backend
            // with no ticket related information available. 
            // Need to reset all ticket-related information
            state.all_tickets_list = [];
            //
            // List of all the ticket-handling agents -- i.e. IT staff
            state.ticket_handling_agents_list = []; 
            //
            // List of ticket status options
            state.ticket_status_options_list = [];
            //
            // List of ticket patching groups
            state.patching_group_list = [];
            state.patching_group_names_list = [];
            //
            // List of ticket patching priority types
            // Patching priorities can also be colloquially referred to as "criticalities"
            state.ticket_patching_priority_types_list = [];
            state.ticket_patching_priority_names_list = [];
        },
        submit_new_ticket_information(state, {
            patching_group_name,
            patching_priority_level,
            patching_ticket_subject_line,
            patching_ticket_message,
            affected_systems_file
        }) {
            // We prepare the data for the ticket-creating POST request
            var formData = new FormData();
            formData.append("message", patching_ticket_message);
            formData.append("actAsType", "customer");
            formData.append("name", state.new_patching_ticket_customer_name);
            formData.append("subject", patching_ticket_subject_line);
            formData.append("from", state.new_patching_ticket_customer_email);
            formData.append("attachments", affected_systems_file);
            //
            console.log("DEBUG -- the patching_group_name that will be used later in this function = " + patching_group_name);
            console.log("DEBUG -- the patching_priority_level that will be used later in this function = " + patching_priority_level);
            // 
            // Launch the request
            //
            new Promise((resolve, reject) => {
                //
                // Making our ticket-creating request!
                axios({
                    url: "/api/v1/ticket",
                    method: "POST",
                    headers: {'Content-Type': 'multipart/form-data'},
                    data: formData
                })
                .then((resp) => {
                    console.log("Retrieved info related to the new ticket created in the backend");
                    console.log("The retrieved data is: ");
                    console.log(resp.data);
                    resolve(resp);
                })
                .catch((err) => {
                    console.log("Failed to create new ticket in the bacekend");
                    console.log(err.response.data);
                    reject(err);
                });
            });
        }
    },
    actions: {
        set_backend_is_available(context) {
            context.commit('set_backend_is_available')
        },
        set_backend_not_available(context) {
            context.commit('set_backend_not_available');
        },
        get_ticket_info_from_backend(context) {
            context.commit('get_ticket_info_from_backend');
        },
        clear_all_ticket_related_information(context) {
            context.commit('clear_all_ticket_related_information');
        },
        submit_new_ticket_information(context, {
            patching_group_name,
            patching_priority_level,
            patching_ticket_subject_line,
            patching_ticket_message,
            affected_systems_file
        }) {
            // we are going to launch the process of mutating the state's information
            context.commit('submit_new_ticket_information', {
                patching_group_name,
                patching_priority_level,
                patching_ticket_subject_line,
                patching_ticket_message,
                affected_systems_file 
            });
        }
    },
    getters: {
        get_backend_is_available(state) {
            return state.backend_available;
        }
    }
});