import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import './plugins/vue-resource';

Vue.config.productionTip = false

new Vue({
  http: {
    root: '/',
  },
  vuetify,
  render: h => h(App)
}).$mount('#app')
