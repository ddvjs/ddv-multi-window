import { assert } from '../util/warn'
import { inBrowser } from '../util/dom'
import { isDef } from '../util/is-def'
import global, { setDdvMultiWindow } from './global'

setDdvMultiWindow(DdvMultiWindow)

const vueAppMethods = [
  // 守护进程id
  'id',
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
export { DdvMultiWindow, DdvMultiWindow as default }
function DdvMultiWindow (app, taskId) {
  this.constructor.apply(this, arguments)
}
DdvMultiWindow.prototype = {
  constructor,
  open,
  remove,
  // 刷新窗口
  refresh,
  close: remove,
  $getBySelfApp,
  $destroy,
  back,
  backRefresh,
  removeBack,
  removeBackRefresh,
  closeBack: removeBack,
  closeBackRefresh: removeBackRefresh
}
const prototypes = {

}

vueAppMethods.forEach(method => {
  if (!DdvMultiWindow.prototype.hasOwnProperty(method)) {
    Object.defineProperty(DdvMultiWindow.prototype, method, {
      get () {
        assert(this._daemonApp, '多窗口没有初始化')
        return this._daemonApp[method]
      },
      set (value) {
        assert(this._daemonApp, '多窗口没有初始化')
        return (this._daemonApp[method] = value)
      }
    })
  }
})

defineProperty('$process', function () {
  return this._selfApp ? this._selfApp._ddvProcess : null
})
defineProperty('$id', function () {
  return this.$process ? this.$process.id : null
})
defineProperty('taskId', function () {
  return this._taskId ? this._taskId : null
})
defineProperty('$parent', function () {
  return this.$process && this.$process.parentDdvMultiWindow ? this.$process.parentDdvMultiWindow : null
})
function $destroy () {
  delete this._daemonApp
  delete this._selfApp
  delete this._taskId
}

function $getBySelfApp (app) {
  return new DdvMultiWindow(this._daemonApp, this._taskId, app)
}

function open (input) {
  return this._daemonApp.open(input, this)
}

function remove (id) {
  const $id = id || this.$id
  return this._daemonApp.remove($id)
}

function refresh (id) {
  const $id = id || this.$id
  return this._daemonApp.refresh($id)
}

function back () {
  return this.$parent && this.tabToWindow(this.$parent.$id)
}

function backRefresh () {
  return this.back().then(() => this.refresh(this.$parent.$id))
}

function removeBack () {
  return this.back().then(() => this.remove())
}

function removeBackRefresh () {
  return this.backRefresh().then(() => this.remove())
}

function constructor (daemonApp, taskId, selfApp) {
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
  this._daemonApp = daemonApp
  this._selfApp = selfApp || this._daemonApp
  this._taskId = taskId
}
function defineProperty (key, get, set) {
  let obj = {}
  if (isDef(get)) {
    obj.get = get
  }
  if (isDef(set)) {
    obj.set = set
  }
  DdvMultiWindow.prototype.hasOwnProperty(key) || Object.defineProperty(DdvMultiWindow.prototype, key, obj)
  obj = void 0
}
