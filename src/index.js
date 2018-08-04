import DdvMultiWindow from './core/api'
import Ready from './core/ready'
import EventMessageWindow from './core/event-message-window'
import { inBrowser } from './util/dom'
import global, { install } from './core/global'

export {
  Ready,
  install,
  global as default,
  EventMessageWindow }

if (inBrowser && window.Vue) {
  window.Vue.use(DdvMultiWindow)
}
