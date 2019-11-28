import "babel-polyfill";
import Promise from "bluebird";
import Vue from "vue";
import App from "./App.vue";
import VueResource from "vue-resource";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "./scss/variables.scss";
import Confirm from "./plugins/confirm";
import Toast from "./plugins/toast";
import Progress from "@/components/Progress.vue";
Vue.config.productionTip = false;
Promise.config({
  // Enable warnings
  warnings: false,
  // Enable long stack traces
  longStackTraces: false,
  // Enable cancellation
  cancellation: false,
  // Enable monitoring
  monitoring: false,
  // Enable async hooks
  asyncHooks: true
});
window.Promise = Promise;
Vue.component("Progress", Progress);
Vue.use(VueResource);
Vue.http.options.emulateHTTP = true;
Vue.http.options.timeout = 15000;
Vue.use(Confirm);
Vue.use(Toast);
const apiHost = "http://192.168.1.189:5022/v2";
Vue.apiHost = apiHost;
Vue.prototype.apiHost = apiHost;
new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
