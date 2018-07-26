import Vue from 'vue'
import DdvMultiWindow from 'ddv-multi-window'
import VueRouter from 'vue-router'
import App from './components/app.vue'
import 'element-ui/lib/theme-chalk/index.css'

import Home from './components/home.vue'
import Master from './components/master.vue'
// 1. Use plugin.
// This installs <router-view> and <router-link>,
// and injects $router and $route to all router-enabled child components
Vue.use(VueRouter)
Vue.use(DdvMultiWindow)

const Foo = { template: '<div>foo</div>' }
const Bar = {
  template: `
    <div>
      bar
      <br/>
      <br/>
      <br/>
      <br/>
      <input type="text" style="border: 1px solid #ccc; width: 150px; height: 30px; line-height: 30px; padding: 0 10px"/>
    </div>
  `
}

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { path: '/', component: Home },
    { path: '/master', component: Master },
    { path: '/foo', component: Foo },
    { path: '/bar', component: Bar }
  ]
})

// 4. Create and mount root instance.
// Make sure to inject the router.
// Route components will be rendered inside <router-view>.
new Vue({
  router,
  template: `<router-view class="view"></router-view>`,
  el: '#app'
})
