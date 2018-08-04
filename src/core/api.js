import { assert } from '../util/warn'
import { inBrowser } from '../util/dom'
import { isDef } from '../util/is-def'
import isFunction from '../util/is-function'
import global, { setDdvMultiWindow } from './global'
import isProduction from '../util/is-production'

const dp = DdvMultiWindow.prototype = Object.create(null)
const hp = Object.hasOwnProperty
const ps = Object.create(null)
const pd = 'proxyDaemonApp'

setDdvMultiWindow(DdvMultiWindow)
// 方法
Object.assign(dp, {
  constructor,
  register,
  unregister,
  open,
  remove,
  // 刷新窗口
  refresh,
  close: remove,
  destroy,
  back,
  backRefresh,
  removeBack,
  removeBackRefresh,
  closeBack: removeBack,
  closeBackRefresh: removeBackRefresh
})
// 属性
Object.assign(ps, {
  // 试图运行
  tryRun: pd,
  // 错误
  onError: pd,
  // 拖到数据
  dragData: pd,
  // 拖到数据
  dragProcess: pd,

  // 进程
  // process: pd,
  // 初始化
  masterViewInit: pd,
  // 切换窗口
  tabToWindow: pd,
  // 根据进程id获取窗口
  getPidByWindow: pd,
  // 根据窗口获取进程id
  getWindowByPid: pd,
  // 新窗口打开
  openMasterWindow: pd,
  // 移动到指定窗口
  windowAppendChild: pd,
  // 拖动到别的管理进程窗口
  tabMoveMasterWindow: pd,
  // 还原
  closeMasterWindow: pd,
  masterMoveParentByTaskId: pd,
  // 所有系统进程
  systemProcess,
  // 进程
  process,
  // 进程id
  id,
  // 父层
  parent,
  // 任务栏id
  taskId,
  // 守护进程id
  daemonId: pd,
  // 守护进程vue实例
  daemonApp
})

function open (input) {
  return this.daemonApp.open(input, this)
}

function remove (id) {
  return this.daemonApp.remove(id || this.id)
}

function refresh (id) {
  return this.daemonApp.refresh(id || this.id)
}
function id () {
  return this.process ? this.process.id : null
}
function process () {
  return this._process ? this._process : null
}
function systemProcess () {
  return this.daemonApp.process
}
function parent () {
  return this.process && this.process.parentDdvMultiWindow ? this.process.parentDdvMultiWindow : null
}
function taskId () {
  return this.process ? this.process.taskId : (this._initTaskId ? this._initTaskId : null)
}
function daemonApp () {
  return this._daemonApp ? this._daemonApp : null
}
function back () {
  return this.parent && this.tabToWindow(this.parent.id)
}

function backRefresh () {
  return this.back().then(() => this.refresh(this.parent.id))
}

function removeBack () {
  return this.back().then(() => this.remove())
}

function removeBackRefresh () {
  return this.backRefresh().then(() => this.remove())
}

Object.keys(ps).forEach(method => {
  if (hp.call(dp, method)) {
    return
  }
  const item = ps[method]
  if (item === pd) {
    Object.defineProperty(dp, method, {
      get () {
        if (!this.daemonApp) {
          debugger
        }
        assert(this.daemonApp, '多窗口没有初始化')
        return this.daemonApp[method]
      },
      set (value) {
        if (!this.daemonApp) {
          debugger
        }
        assert(this.daemonApp, '多窗口没有初始化')
        return (this.daemonApp[method] = value)
      }
    })
  } else if (isFunction(item)) {
    Object.defineProperty(dp, method, { get: item })
  } else if (Array.isArray(item)) {
    const obj = {}
    if (isDef(item[0]) && isFunction(item[0])) {
      obj.get = item[0]
    }
    if (isDef(item[1]) && isFunction(item[1])) {
      obj.set = item[1]
    }
    Object.defineProperty(dp, method, obj)
  }
})

function DdvMultiWindow () {
  if (this instanceof DdvMultiWindow) {
    return this.constructor.apply(this, arguments)
  } else {
    throw Error('Must `new DdvMultiWindow()`')
  }
}

function constructor (daemonApp, taskId, process) {
  // 非产品模式需要判断是否已经调用Vue.use(DdvMultiWindow)安装
  assert(
    isProduction || global.installed,
    `not installed. Make sure to call \`Vue.use(DdvMultiWindow)\` ` +
    `before creating root instance.`
  )
  assert(
    isProduction || inBrowser,
    `必须有一个window`
  )
  this._daemonApp = daemonApp
  this._initTaskId = taskId
  this._process = process || null
}
function register (vm) {
  Array.isArray(this.vueModels) && this.vueModels.push(vm)
  if (this.process && vm && vm.$options.beforeDdvMultiWindowRefresh && vm.$options.beforeDdvMultiWindowRefresh.length) {
    this.process.hook.beforeRefresh.push.apply(this.process.hook.beforeRefresh, vm.$options.beforeDdvMultiWindowRefresh)
  }
}
function unregister (vm) {
  if (this.process && this.process.hook && vm && vm.$options && vm.$options.beforeDdvMultiWindowRefresh) {
    this.process.hook.beforeRefresh = this.process.hook.beforeRefresh.filter(fn => {
      return vm.$options.beforeDdvMultiWindowRefresh.indexOf(fn) < 0
    })
  }
  if (Array.isArray(this.vueModels)) {
    this.vueModels = this.vueModels.filter(v => (vm !== v))
    this.vueModels.length || this.destroy()
  }
}
function destroy () {
  delete this._daemonApp
  delete this._initTaskId
  delete this._process
}

export { DdvMultiWindow, DdvMultiWindow as default }
