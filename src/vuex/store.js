/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-07-22 09:30:11
 * @LastEditTime: 2019-09-05 10:12:35
 * @LastEditors: Please set LastEditors
 */
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    areacode: "440305",//当前选择区划
  },
  mutations: {
    //改变areacode
    changeAreaCode(state, code) {
      state.areacode = code;
    }
  },
  actions: {}
});
