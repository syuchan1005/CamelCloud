import Vue from 'vue';
import VueI18n from 'vue-i18n';
import store from '../store';

import en from './en';
import ja from './ja';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: navigator.language,
  fallbackLocale: 'en',
  messages: {
    en,
    ja,
  },
});

store.commit('locale', i18n.locale);
store.watch(state => state.locale, (locale) => {
  i18n.locale = locale;
});

export default i18n;
