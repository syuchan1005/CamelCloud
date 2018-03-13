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
      type: '',
      login: false,
      userId: undefined,
    },
    locale: '',
  },
  mutations: {
    viewFilter(state, type) {
      state.viewFilter = type;
    },
    setAuth(state, data) {
      state.auth.login = data.auth;
      state.auth.userId = data.userId;
    },
    authType(state, data) {
      state.auth.type = data;
    },
    locale(state, lang) {
      state.locale = lang;
    },
  },
  getters: {
    getViewFilter: state => state.viewFilter,
  },
});
