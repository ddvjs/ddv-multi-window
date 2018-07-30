<template>
  <div>
    <a href="/">&larr; Examples index</a>
    <ddv-multi-window-daemon ref="windowDaemon" openMasterWindowSrc="/basic/master">
      <!-- <ddv-multi-window-task-template slot="task" slot-scope="scope" v-bind="scope"/> -->
    </ddv-multi-window-daemon>
    <section>
      <ddv-multi-window-task />
      <div class="tabwb-main__wrap clearfix">
        <ddv-multi-window-view />
      </div>
    </section>
  </div>
</template>

<script>
import Vue from 'vue'
import ElementUI from 'element-ui'
import ddvMultiWindow from 'ddv-multi-window'
import '@/dist/style/ddv-multi-window.css'

Vue.use(ddvMultiWindow, { 'namespace': '__DDV_MULTI_WINDOW__' })
Vue.use(ElementUI)

export default {
  data () {
    return {}
  },
  components: {},
  methods: {},
  mounted () {
    this.$refs.windowDaemon.onError(e => {
      this.$alert(e.message, '提示', {
        type: 'error'
      })
      console.error(e)
    })
    this.$refs.windowDaemon.open({
      src: '/basic/foo',
      title: 'test2'
    })
    this.$refs.windowDaemon.open({
      refreshable: true,
      title: 'test3',
      src: '/basic/bar'
    })
    this.$refs.windowDaemon.open({
      refreshable: true,
      title: 'test4',
      src: '/basic/bar'
    })
    this.$refs.windowDaemon.open({
      refreshable: true,
      title: 'test5',
      src: '/basic/bar'
    })
    this.$refs.windowDaemon.open({
      refreshable: true,
      title: 'test6',
      path: '/basic/bar',
      query: {
        xx: 11,
        iii: 222
      }
    })
  }
}
</script>

<style>
.tabwb-main__wrap {
  clear: both;
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  min-width: 1200px;
  position: relative;
  padding: 15px;
}
</style>

