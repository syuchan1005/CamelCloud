// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.css';
import 'material-design-icons/iconfont/material-icons.css';
import Snotify, { SnotifyPosition } from 'vue-snotify';
import 'vue-snotify/styles/material.css';
import axios from 'axios';
import VueAxios from 'vue-axios';
import titleMixin from './mixin/title';
import App from './App';
import router from './router';
import store from './store';

Vue.config.productionTip = false;
Vue.mixin(titleMixin);

Vue.use(VueMaterial);
Vue.use(Snotify, {
  toast: {
    position: SnotifyPosition.rightTop,
  },
});
Vue.use(VueAxios, axios);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
});
