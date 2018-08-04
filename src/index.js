import DdvMultiWindow from './core/api'
import Ready from './core/ready'
import EventMessageWindow from './core/event-message-window'
import { inBrowser } from './util/dom'
import global from './core/global'
export let _Vue

export { global as default, Ready, EventMessageWindow }

if (inBrowser && window.Vue) {
  window.Vue.use(DdvMultiWindow)
}
