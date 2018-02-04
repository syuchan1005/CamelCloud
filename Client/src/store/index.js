/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    viewFilter: undefined,
    token: undefined,
  },
  mutations: {
    viewFilter(state, type) {
      state.viewFilter = type;
    },
    token(state, token) {
      state.token = token;
    },
  },
  getters: {
    isLogin(state) {
      return Boolean(state.token);
    },
  },
});
