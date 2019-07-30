import Vue from "vue";
import 'normalize.css/normalize.css';
import { Button, Select } from 'element-ui';

import App from "./App.vue";
import router from "./router/router";
import store from "./vuex/store";

Vue.config.productionTip = false;

//按需引入element组件
Vue.use(Button);
Vue.use(Select);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
