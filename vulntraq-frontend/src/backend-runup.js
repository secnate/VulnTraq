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
            resolve(resp);
            store.dispatch({
              type: types.Set_Backend_Available
            });
          })
          .catch((err) => {
            console.log("Failed to connect to backend");
            reject(err);
            store.dispatch({
              type: types.Set_Backend_Not_Available
            });
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