<template>
  <section>
    ss
    <ddv-multi-window-task />
    <div class="tabwb-main__wrap clearfix">
      <ddv-multi-window-view class="xxxx"/>
    </div>
  </section>
</template>

<script>
import Vue from 'vue'
import ElementUI from 'element-ui'
import ddvMultiWindow from 'ddv-multi-window'

Vue.use(ddvMultiWindow, { 'namespace': '__DDV_MULTI_WINDOW__' })
Vue.use(ElementUI)

export default {
  data () {
    return {}
  },
  mounted () {
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

