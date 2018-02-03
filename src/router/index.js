import Vue from 'vue';
import Router from 'vue-router';
import Hello from '@/components/unauth/Hello';
import Error from '@/components/unauth/Error';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello,
    },
    {
      path: '*',
      name: 'Error',
      component: Error,
    },
  ],
});
