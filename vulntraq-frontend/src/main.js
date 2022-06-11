import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import App from './App.vue'
import store from './store/store.js'

// Importing Bootstrap and BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// We import Axios to now query data from the backend
import Axios from "axios";
import execute from './backend-runup';

// Vue Settings
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.config.productionTip = false;

// Initializing the API URL. 
// It may need to change if the free version of Ngrok is used as a
// reverse proxy in the virtualized backend server. This is because
// Ngrok's free version does not result in a constant long-term URL
Axios.defaults.baseURL = `https://7574-75-183-154-210.ngrok.io`;
Vue.prototype.$backendURL = Axios.defaults.baseURL

// Mount the main vue object (event bus)
execute(Vue)
  .then(() => mountRoot())
  .catch(() => mountRoot());

function mountRoot() {
  new Vue({
    store,
    render: h => h(App)
  }).$mount('#app');
}