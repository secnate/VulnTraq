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

            // Need to signal that the backend information is *not* available
            store.dispatch({
              type: types.SET_BACKEND_NOT_AVAILABLE
            });

            // Need to signal to clear up all ticketing related information in the frontend
            // Since we are not able to connect to backend to get the latest data
            store.dispatch({
              type: types.CLEAR_ALL_TICKET_RELATED_INFORMATION
            });

            reject(err);
          });
    });
}

// This is a function that can be used to verify 
// whether the backend is up or not
export function backendIsUp() {
  return store.state.backend_available;
}

export default function execute() {
    return Promise.all([checkBackendIsUp()]);
}