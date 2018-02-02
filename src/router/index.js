import Vue from 'vue';
import Router from 'vue-router';
import Hello from '@/components/unauth/Hello';
import Error from '@/components/unauth/Error';
import Login from '@/components/unauth/Login';

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
      name: 'Login',
      component: Login,
    },
    {
      path: '*',
      name: 'Error',
      component: Error,
    }
  ],
});
