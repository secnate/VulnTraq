// store.js
// Uses Vuex to store the frontend application's data across all components
import axios from "axios";
import Vue from 'vue';
import Vuex from 'vuex';

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
        // A list of the ids of the tickets displayed in the table
        displayed_table_ticket_ids: [],
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
        // List of objects mapping the ticket ids' to the specific properties
        // that are only found when examining each one on an individual level
        additional_ticket_properties_list: [],
        //
        // Default information for creating a new vulnerability ticket
        new_patching_ticket_customer_name: "VulnTraq Application",
        new_patching_ticket_customer_email: "vulntraqappemail@gmail.com",
        //
        //////////////////////////////////////////////////////////////////////////////////
        // Information used for creating a new vulnerability ticket containing information regarding
        // the patching priority group and priority level & retrieving the data later on
        PATCHING_PRIORITY_LEVEL_STRING: "PATCHING PRIORITY LEVEL",
        PATCHING_PRIORITY_LEVEL_GROUP: "PATCHING PRIORITY GROUP",
        //
        //     This is the separator character used for building the key-value relationship
        //     of data stored in a newly-created vulnerability patch ticket's message body.
        //
        //     The format is: "<KEY>: <VALUE>", with the ": " separating the two fields.
        //     The regex version of the ": " is "\: " and is used to construct regexes
        PATCH_TICKET_KEY_VALUE_SEPARATOR_STRING: ": ",
        PATCH_TICKET_KEY_VALUE_SEPARATOR_STRING_REGEX_VERSION: "\\: ",
        //
        // This string is used to separate the actual message from the other data points 
        // regarding patching priority and group inserted into the message field below
        PATCH_TICKET_MESSAGE_AND_APPENDIX_SEPARATOR: "----------",
        //
        ///////////////////////////////////////////////////////////////////////////////////
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
                    console.log("DEBUG -- the ticket info received from backend is = ");
                    console.log(resp.data);
                    console.log();

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
                            value: state.patching_group_list[i]["name"]
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
                    //
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
                            value: state.ticket_patching_priority_types_list[i]["name"]
                        });
                    }
                    //
                    console.log("Retrieved ticket-related info from backend");
                })
                .then( (resp) => {
                    //
                    // Need to now initialize an array of objects mapping the ticket ids' 
                    // to the specific properties that are only found when examining 
                    // each one in detail and in depth on an individual level
                    state.additional_ticket_properties_list = [];
                    //
                    for (var i = 0; i < state.all_tickets_list.length; i++) {
                        
                        var examined_ticket_id = state.all_tickets_list[i]["id"];

                        // We need to check if we already have the ticket displayed
                        // If it is already displayed, we *already* have all the ticket's
                        // basic and supplementary information stored & it displayed. 
                        // No need to spin extra cycles in getting the ticket-specific
                        // information with regards to it and then processing it
                        if (state.displayed_table_ticket_ids.indexOf(examined_ticket_id) != -1) {
                            continue 
                        }
                        //
                        new Promise((resolve, reject) => {
                            //
                            // Making our ticket-creating request!
                            axios({
                                url: "/api/v1/ticket/" + examined_ticket_id,
                                method: "GET",
                            })
                            .then((individual_ticket_resp) => {
                                
                                // We are now getting specific information for this ticket
                                // But this information is stored inside the ticket-creating thread.... so need to get the data
                                var thread_list = individual_ticket_resp.data["ticket"]["threads"];
                                var create_ticket_thread = null;
                                //
                                for (var thread_index = 0; thread_index < thread_list.length; thread_index++) {
                                    if (thread_list[thread_index]["threadType"] == "create") {
                                        create_ticket_thread = thread_list[thread_index];
                                        break;
                                    }
                                }
                                //
                                //
                                if (create_ticket_thread != null) {
                                    //
                                    // We got the thread for creating the ticket
                                    // Inside the thread is a message string of the following format
                                    //
                                    //   <MESSAGE>\n\n----------\nPATCHING PRIORITY LEVEL: <PRIORITY>\nPATCHING PRIORITY GROUP: <GROUP>\n
                                    //
                                    // Need to extract the values of <MESSAGE>, <PRIORITY>, and <GROUP> before 
                                    // putting those into the extracted_ticket_info object.
                                    var create_ticket_thread_message_text_string = create_ticket_thread["message"];

                                    var beginning_message_separator_index = create_ticket_thread["message"].indexOf(state.PATCH_TICKET_MESSAGE_AND_APPENDIX_SEPARATOR);
                                    var the_message_itself = create_ticket_thread["message"].substr(0, beginning_message_separator_index).trim();
                                    
                                    var extracted_patching_group_name = create_ticket_thread_message_text_string.match(
                                            state.PATCHING_PRIORITY_LEVEL_GROUP + 
                                            state.PATCH_TICKET_KEY_VALUE_SEPARATOR_STRING_REGEX_VERSION + "(.*)"
                                        )[1];
                                                                        
                                    var extracted_priority_level = create_ticket_thread_message_text_string.match(
                                        state.PATCHING_PRIORITY_LEVEL_STRING + 
                                        state.PATCH_TICKET_KEY_VALUE_SEPARATOR_STRING_REGEX_VERSION + "(.*)"
                                        )[1];
                                    
                                    var extracted_attachment_path = create_ticket_thread["attachments"][0]["path"];
                                    
                                    var extracted_ticket_info = {
                                        id: individual_ticket_resp.data["ticket"]["id"],
                                        message: the_message_itself,
                                        priority_level: extracted_priority_level,
                                        patching_group: extracted_patching_group_name,
                                        attachment_path: extracted_attachment_path
                                    }

                                    // We load the information into the state.additional_ticket_properties list for future use
                                    state.additional_ticket_properties_list.push(extracted_ticket_info);
                                    resolve(individual_ticket_resp);
                                }
                            })
                            .catch((individual_ticket_err) => {
                                console.log("Failed to retrieve info related to the *specific* ticket of id = " + examined_ticket_id);
                                reject(individual_ticket_err);
                            });
                        });
                    }

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
            state.displayed_table_ticket_ids = [];
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
            //
            // List of objects mapping the ticket ids' to the specific properties
            // that are only found when examining each one on an individual level
            state.additional_ticket_properties_list = [];
        },
        submit_new_ticket_information(state, {
            patching_group_name,
            patching_priority_level,
            patching_ticket_subject_line,
            patching_ticket_message,
            affected_systems_file
        }) {
            //////////////////////////////////////////////////////////////////
            // Since the UVDesk backend API bundle request's documentation was horrendously
            // sparse & underdocumented  and the project has a tight timespan for development,
            // we will be using *only* the ticket-creating POST request.
            // 
            // That ticket-creating POST request however lacks the fields specifying
            // the priority of the ticket to be created and the group it is to be assigned to.
            //
            // Therefore, in a hacky workaround, the vulnerability-patching tickets'
            // message field will have information regarding its patching priority
            // and the patching group (of IT administrators) it will be assigned to.
            //
            // This is not ideal. Ideally the PATCH {helpdesk_url}/api/v1/ticket/{ticketId}
            // API instruction would have been used to tweak the newly-created ticket's settings
            // to assign it the appropriate priority level and patching group. 
            //
            // However, attempts to get the PATCH method working over multiple days were unsuccessful
            // and the documentation was sparse. Because the project could not afford to be bogged down,
            // had to look for a different alternative method to get the desired data uploaded into the server. 
            //
            // Hence, this hacky workaround will do.
            var completed_message_to_submit = patching_ticket_message;
            completed_message_to_submit += "\n\n" + state.PATCH_TICKET_MESSAGE_AND_APPENDIX_SEPARATOR + "\n";
            completed_message_to_submit += state.PATCHING_PRIORITY_LEVEL_STRING + ": " + patching_priority_level + "\n";
            completed_message_to_submit += state.PATCHING_PRIORITY_LEVEL_GROUP + ": " + patching_group_name + "\n";
            //
            //
            //////////////////////////////////////////////////////////////////
            // We prepare the data for the ticket-creating POST request
            var formData = new FormData();
            formData.append("message", completed_message_to_submit);
            formData.append("actAsType", "customer");
            formData.append("name", state.new_patching_ticket_customer_name);
            formData.append("subject", patching_ticket_subject_line);
            formData.append("from", state.new_patching_ticket_customer_email);
            formData.append("attachments", affected_systems_file);
            // 
            // Launch the ticket-creating request
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
            // We are going to launch the process of mutating the state's information
            context.commit('submit_new_ticket_information', {
                patching_group_name,
                patching_priority_level,
                patching_ticket_subject_line,
                patching_ticket_message,
                affected_systems_file
            });

            // Need to update our state-related information after creating a new ticket 
            // and get the updated list of all tickets' information
            context.commit('get_ticket_info_from_backend');
        }
    },
    getters: {
        get_backend_is_available(state) {
            return state.backend_available;
        }
    }
});