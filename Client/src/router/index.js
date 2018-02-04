import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';
import Hello from '@/components/Hello';
import Error from '@/components/Error';
import CameraRoll from '@/components/CameraRoll';

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
    {
      path: '/view',
      name: 'CameraRoll',
      component: CameraRoll,
      meta: {
        auth: true,
        menu: true,
      },
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
