import { assert } from '../util/warn'
import { inBrowser } from '../util/dom'
import { isDef } from '../util/is-def'
import isFunction from '../util/is-function'
import global, { setDdvMultiWindow } from './global'

const dp = DdvMultiWindow.prototype = Object.create(null)
const hp = Object.hasOwnProperty
const ps = Object.create(null)
const pd = 'proxyDaemonApp'
const isp = process.env.NODE_ENV !== 'production'

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
Object.assign(dp, {
  constructor,
  open,
  remove,
  // 刷新窗口
  refresh,
  close: remove,
  $getBySelfApp,
  destroy,
  back,
  backRefresh,
  removeBack,
  removeBackRefresh,
  closeBack: removeBack,
  closeBackRefresh: removeBackRefresh
})
Object.assign(ps, {
  $process () {
    return this._selfApp ? this._selfApp._ddvProcess : null
  },
  $id () {
    return this.$process ? this.$process.id : null
  },
  taskId () {
    return this._taskId ? this._taskId : null
  },
  $parent () {
    return this.$process && this.$process.parentDdvMultiWindow ? this.$process.parentDdvMultiWindow : null
  },
  daemonApp () {
    return this._daemonApp ? this._daemonApp : null
  },
  selfApp () {
    return this._selfApp ? this._selfApp : null
  }
})

vueAppMethods.forEach(method => {
  if (!hp.call(dp, method)) {
    Object.defineProperty(dp, method, {
      get () {
        assert(this.daemonApp, '多窗口没有初始化')
        return this.daemonApp[method]
      },
      set (value) {
        assert(this.daemonApp, '多窗口没有初始化')
        return (this.daemonApp[method] = value)
      }
    })
  }
})

function $getBySelfApp (app) {
  return new DdvMultiWindow(this._daemonApp, this._taskId, app)
}

function open (input) {
  return this.daemonApp.open(input, this)
}

function remove (id) {
  const $id = id || this.$id
  return this.daemonApp.remove($id)
}

function refresh (id) {
  const $id = id || this.$id
  return this.daemonApp.refresh($id)
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

Object.keys(ps).forEach(method => {
  if (hp.call(dp, method)) {
    return
  }
  const item = ps[method]
  if (item === pd) {
    Object.defineProperty(dp, method, {
      get () {
        assert(this.daemonApp, '多窗口没有初始化')
        return this.daemonApp[method]
      },
      set (value) {
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

function constructor (daemonApp, taskId, selfApp) {
  // 非产品模式需要判断是否已经调用Vue.use(DdvMultiWindow)安装
  assert(
    isp || global.installed,
    `not installed. Make sure to call \`Vue.use(DdvMultiWindow)\` ` +
    `before creating root instance.`
  )
  assert(
    isp || inBrowser,
    `必须有一个window`
  )
  this._daemonApp = daemonApp
  this._selfApp = selfApp || daemonApp
  this._taskId = taskId
}
function destroy () {
  delete this._daemonApp
  delete this._selfApp
  delete this._taskId
}

export { DdvMultiWindow, DdvMultiWindow as default }
