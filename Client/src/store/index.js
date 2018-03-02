/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [createPersistedState({ storage: window.sessionStorage })],
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
    setAuth(state, data) {
      state.auth.login = data.auth;
      state.auth.userId = data.userId;
    },
  },
  getters: {
    getViewFilter: state => state.viewFilter,
  },
});
