import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';
import Hello from '@/components/unauth/Hello';
import Error from '@/components/unauth/Error';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      alias: '/login',
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

router.beforeEach((to, from, next) => {
  if (to.meta.auth && !store.getters.isLogin) {
    next({ path: '/login' });
  } else {
    next();
  }
});

export default router;
