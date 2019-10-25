import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import './plugins/vue-resource';

Vue.config.productionTip = false

new Vue({
  http: {
    root: '/',
    headers: {
      Authorization: 'Basic YXBpOnBhc3N3b3Jk'
    }
  },
  vuetify,
  render: h => h(App)
}).$mount('#app')
