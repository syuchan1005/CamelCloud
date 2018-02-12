/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    viewFilter: undefined,
    auth: {
      login: false,
      userId: undefined,
    },
  },
  mutations: {
    viewFilter(state, type) {
      state.viewFilter = type;
    },
    setAuth(state, auth) {
      state.auth.login = auth.authed;
      state.auth.userId = auth.userId;
    },
  },
});
