/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-07-22 09:30:11
 * @LastEditTime: 2019-08-27 15:44:48
 * @LastEditors: Please set LastEditors
 */
import Vue from "vue";
import 'normalize.css/normalize.css';
import { Button, Select, Tabs,TabPane,Input } from 'element-ui';

import App from "./App.vue";
import router from "./router/router";
import store from "./vuex/store";

Vue.config.productionTip = false;

//按需引入element组件
Vue.use(Button);
Vue.use(Select);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Input)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
