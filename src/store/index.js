import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    viewFilter: undefined,
  },
  getters: {
    isLogin(/* state */) {
      return true;
    },
  },
});
