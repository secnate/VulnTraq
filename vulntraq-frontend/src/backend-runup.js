import axios from "axios";
import store from './store/store.js';
import * as types from './store/mutationTypes.js';

// Checks whether or not the backend server 
// is up -- or at least contactable
export function checkBackendIsUp() {

    return new Promise((resolve, reject) => {
        // Check if backend is online & accessible
        axios({
          url: "/",
          method: "GET",
        })
          .then((resp) => {
            console.log("Connected to backend");
            
            // Need to signal that we have the backend information available
            store.dispatch({
              type: types.SET_BACKEND_AVAILABLE
            });

            // Need to signal to retrieve all ticketing related information from backend
            store.dispatch({
              type: types.GET_TICKET_INFORMATION_FROM_BACKEND
            });

            resolve(resp);
          })
          .catch((err) => {
            console.log("Failed to connect to backend");

            // Need to gather information regarding whether we previously had connection 
            // to the backend. If this is the case, we will need to notify the user later
            var previously_had_connection_to_backend = store.getters.get_backend_is_available;

            // Need to signal that the backend information is *not* available
            store.dispatch({
              type: types.SET_BACKEND_NOT_AVAILABLE
            });

            // Need to signal to clear up all ticketing related information in the frontend
            // Since we are not able to connect to backend to get the latest data
            store.dispatch({
              type: types.CLEAR_ALL_TICKET_RELATED_INFORMATION
            });

            // If we previously *had* a connection to the backend and don't now, need to notify the user
            if (previously_had_connection_to_backend) {
              alert('Could Not Perform The Specified Action\nThe VulnTraq Server Is Not Reachable');
            }
            reject(err);
          });
    });
}

// Check if backend is online & accessible *WITHOUT* retrieving all ticket related information
// Especially useful if the application was running and we want to verify that all's good for a minor action
export function checkIfContinuedBackendConnection() {
    return new Promise((resolve, reject) => {
        axios({
          url: "/",
          method: "GET",
        })
          .then((resp) => {
            console.log("Connection to backend is still up");
            
            // No need to adjust the store's settings regarding backend being available.
            // This is because the store's backend_available boolean is already set to "true"
            resolve(resp);
          })
          .catch((err) => {
            console.log("Connection to backend is broken");

            // Need to gather information regarding whether we previously had connection 
            // to the backend. If this is the case, we will need to notify the user later
            var previously_had_connection_to_backend = store.getters.get_backend_is_available;

            // Need to signal that the backend information is *not* available
            store.dispatch({
              type: types.SET_BACKEND_NOT_AVAILABLE
            });

            // If we previously *had* a connection to the backend and don't now, need to notify the user
            if (previously_had_connection_to_backend) {
              alert('Could Not Perform The Specified Action\nLost Connection To The VulnTraq Server');
            }
            reject(err);
          });
    });
}

// This is a function that can be used to verify 
// whether the backend is up or not
export function backendIsUp() {
  return store.getters.get_backend_is_available;
}

export default function execute() {
    return Promise.all([checkBackendIsUp()]);
}