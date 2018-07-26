import { assert } from './util/warn'
import { inBrowser } from './util/dom'

const vueAppMethods = [
  // 守护进程id
  'id',
  // 打开新窗口
  'open',
  // 移除窗口
  'remove',
  // 刷新窗口
  'refresh',
  // 试图运行
  'tryRun',
  // 进程
  'process',
  // 错误
  'onError',
  // 拖到数据
  'dragData',
  // 拖到数据
  'dragProcess',
  // 初始化
  'masterViewInit',
  // 切换窗口
  'tabToWindow',
  // 根据进程id获取窗口
  'getPidByWindow',
  // 根据窗口获取进程id
  'getWindowByPid',
  // 新窗口打开
  'openMasterWindow',
  // 移动到指定窗口
  'windowAppendChild',
  // 拖动到别的管理进程窗口
  'tabMoveMasterWindow',
  // 还原
  'closeMasterWindow',
  'masterMoveParentByTaskId'
]
export let global
export function globalInit (g) {
  global = g
}
export { DdvMultiWindow, DdvMultiWindow as default }
function DdvMultiWindow (app, taskId) {
  this.constructor(app, taskId)
}
DdvMultiWindow.prototype = {
  constructor,
  open
}

vueAppMethods.forEach(method => {
  if (!DdvMultiWindow.prototype.hasOwnProperty(method)) {
    Object.defineProperty(DdvMultiWindow.prototype, method, {
      get () {
        assert(this.app, '多窗口没有初始化')
        return this.app[method]
      },
      set (value) {
        assert(this.app, '多窗口没有初始化')
        return (this.app[method] = value)
      }
    })
  }
})
function open (input) {
  return this.app.open(input, this.taskId)
}
function constructor (app, taskId) {
  // 非产品模式需要判断是否已经调用Vue.use(DdvMultiWindow)安装
  process.env.NODE_ENV !== 'production' && assert(
    global.installed,
    `not installed. Make sure to call \`Vue.use(DdvMultiWindow)\` ` +
    `before creating root instance.`
  )
  process.env.NODE_ENV !== 'production' && assert(
    inBrowser,
    `必须有一个window`
  )
  this.app = app
  this.taskId = taskId
}
