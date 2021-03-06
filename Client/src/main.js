import Vue from 'vue';

import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.css';
import 'material-design-icons/iconfont/material-icons.css';

import Snotify, { SnotifyPosition } from 'vue-snotify';
import 'vue-snotify/styles/material.css';

import axios from 'axios';
import VueAxios from 'vue-axios';

import Icon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/twitter';
import 'vue-awesome/icons/facebook';
import 'vue-awesome/icons/instagram';
import 'vue-awesome/icons/folder-open';
import 'vue-awesome/icons/file-o';

import titleMixin from './modules/titleMixin';
import App from './App';
import router from './router';
import store from './store';
import i18n from './i18n';

Vue.mixin(titleMixin);

Vue.use(VueMaterial);
Vue.use(Snotify, {
  toast: {
    position: SnotifyPosition.rightTop,
  },
});

if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable no-new,global-require */
  const AxiosMock = require('./modules/AxiosMock').default;
  new AxiosMock(axios);
}

Vue.use(VueAxios, axios);

Vue.component('icon', Icon);


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  template: '<App/>',
  components: { App },
});
