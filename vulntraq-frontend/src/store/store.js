// store.js
// Uses Vuex to store the frontend application's data across all components
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        // The backend_available indicates whether the frontend can reach
        // out to the backend server for data successfully. 
        //
        // Since we are not going to assume that the backend is up without
        // proper verification, the default value will be false
        backend_available: false
    },
    mutations: {
        set_backend_is_available(state) {
            state.backend_available = true
            return state.backend_available
        },
        set_backend_not_available(state) {
            state.backend_available = false

            return state.backend_available
        }
    },
    actions: {
        set_backend_is_available(context) {
            context.commit('set_backend_is_available')
        },
        set_backend_not_available(context) {
            context.commit('set_backend_not_available');
        }
    }
});