/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    viewFilter: undefined,
    auth: {
      login: false,
    },
  },
  mutations: {
    viewFilter(state, type) {
      state.viewFilter = type;
    },
    setLogin(state, login) {
      state.auth.login = login;
    },
  },
});
