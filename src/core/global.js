import Ready from './ready'
import Task from '../components/task'
import Daemon from '../components/daemon'
import Button from '../components/button'
import Master from '../components/master'
import DmwButton from '../components/dmw-button'
import MasterTask from '../components/master-task'
import MasterView from '../components/master-view'
import getByParent from '../util/get-by-parent'
import isFunction from '../util/is-function'
import getError, { throwError } from '../util/get-error'
import { isDef, unDefDefaultByObj } from '../util/is-def'
import { warn } from '../util/warn'
import { getWindow, getDaemonWindow } from '../util/window'

const dp = DdvMultiWindowGlobal.prototype = Object.create(null)
const ps = Object.create(null)
const global = new DdvMultiWindowGlobal()
const hp = Object.hasOwnProperty

Object.assign(global, {
  get,
  isDaemon: true,
  version: '__VERSION__',
  Ready,
  install: vueInstall,
  installed: false,
  daemonInit,
  masterInit
})
function daemonInit (app) {
  if (this.$isServer) {
    return
  }
  const daemonId = app.daemonId
  if (!daemonId) {
    return throwError('not installed. Make sure to call `daemonInit(app)`before creating root instance.', 'DAEMON_NOT_INIT', false)
  }
  if (!this.map[daemonId]) {
    this.map[daemonId] = {
      app,
      api: {}
    }
  }
  const ddvMultiWindow = app._ddvMultiWindow = this.get(daemonId, 'daemon', 0)
  return ddvMultiWindow
}
function masterInit (app) {
  if (this.$isServer) {
    return
  }
  if (!this.installed) {
    throw getError('not installed. Make sure to call `Vue.use(DdvMultiWindow)`before creating root instance.')
  }
  if (!app) {
    throw getError('必须传入app实例')
  }
  const daemonId = app.daemonId

  return this.get(daemonId)
    .then(ddvMultiWindow => {
      try {
        if (this.contentWindow && ddvMultiWindow) {
          this.contentWindow.name = ddvMultiWindow.taskId
        }
      } catch (e) {}
      app._ddvMultiWindow = ddvMultiWindow
      return ddvMultiWindow
    }, e => {
      let ddvMultiWindow
      if (e.name === 'DAEMONID_NOT_EXIST' && (ddvMultiWindow = getByParent(app, '_ddvMultiWindow'))) {
        return ddvMultiWindow
      } else {
        return Promise.reject(e)
      }
    })
}
function get (daemonId, taskId, tryNumMax, tryNum) {
  const isPromise = tryNumMax !== 0
  if (!this.installed) {
    return throwError('not installed. Make sure to call `Vue.use(DdvMultiWindow)`before creating root instance.', 'MUST_VUE_USE_DDV_MULTI_WINDOW', isPromise)
  }
  const item = this.map[daemonId]
  // 获取获取该窗口
  if (!(item && item.app && item.api)) {
    return throwError('daemonId does not exist', 'DAEMONID_NOT_EXIST', isPromise)
  }
  if (taskId && item.api[taskId]) {
    return isPromise ? Promise.resolve(item.api[taskId]) : item.api[taskId]
  }
  if (taskId === 'daemon') {
    item.api.daemon = new DdvMultiWindow(item.app, taskId)
    return isPromise ? Promise.resolve(item.api.daemon) : item.api.daemon
  }
  taskId = item.api.daemon.getPidByWindow(this.contentWindow, tryNumMax, tryNum)
  if (isPromise) {
    return taskId.then(taskId => {
      if (taskId && !item.api[taskId]) {
        item.api[taskId] = new DdvMultiWindow(item.app, taskId)
      }
      return Promise.resolve(item.api[taskId])
    })
  } else {
    if (taskId && !item.api[taskId]) {
      item.api[taskId] = new DdvMultiWindow(item.app, taskId)
    }
    return item.api[taskId]
  }
}
function vueInstall (Vue, options) {
  if ((this.installing || this.installed) && this.$Vue === Vue) return
  // 防止多次重复安装
  this.installing = true
  // 保存当前安装的vue
  this.$Vue = Vue
  // 存储配置项
  this.options = options
  // Vue安装
  // 钩子安装
  hookInstall.call(this, Vue)
  // 组件安装
  componentInstall.call(this, Vue)
  // 继承安装
  VuePrototypeInstall.call(this, Vue)
  // 接口安装
  RegisterInstanceInstall.call(this, Vue)

  if (Vue.prototype.$isServer) {
    // 防止多次重复安装
    this.installing = false
    // 防止多次重复安装
    this.installed = true
    // 服务端不进一步初始化
    return
  }
  // 初始化
  optionsInstall.call(this)
  // 初始化
  daemonWindowInstall.call(this)
  // 全局注册
  namespaceReg.call(this)
  // 存储初始化
  mapInstall.call(this)
  // 防止多次重复安装
  this.installing = false
  // 防止多次重复安装
  this.installed = true
}

function hookInstall (Vue) {
  // 管理状态
  const strats = Vue.config.optionMergeStrategies
  // 对窗口挂钩使用相同的钩子合并策略
  strats.beforeDdvMultiWindowOpen = strats.ddvMultiWindowOpened = strats.beforeDdvMultiWindowRemove = strats.ddvMultiWindowRemoved = strats.beforeDdvMultiWindowRefresh = strats.ddvMultiWindowRefreshed = strats.created
}
function componentInstall (Vue) {
  // 安装组件
  Vue.component(Task.name, Task)
  Vue.component(Daemon.name, Daemon)
  Vue.component(Button.name, Button)
  Vue.component(Master.name, Master)
  Vue.component(DmwButton.name, DmwButton)
  Vue.component(MasterTask.name, MasterTask)
  Vue.component(MasterView.name, MasterView)
}
function RegisterInstanceInstall (Vue) {
  Vue.mixin({
    beforeCreate () {
      if (!this._ddvMultiWindow) {
        this._ddvMultiWindow = this.$options._ddvMultiWindow || getByParent(this.$parent, '_ddvMultiWindow')
      }
      if (this._ddvMultiWindow) {
        this._ddvMultiWindow.register(this)
      }
    },
    destroyed () {
      if (this._ddvMultiWindow && this._ddvMultiWindow.unregister) {
        this._ddvMultiWindow.unregister(this)
        delete this._ddvMultiWindow
      }
    }
  })
}
function VuePrototypeInstall (Vue) {
  hp.call(Vue.prototype, '$ddvMultiWindow') || Object.defineProperty(Vue.prototype, '$ddvMultiWindow', {
    get () {
      if (!this._ddvMultiWindow) {
        this._ddvMultiWindow = getByParent(this, '_ddvMultiWindow')
      }
      if (!this._ddvMultiWindow) {
        throw getError('Not initialized')
      } else {
        return this._ddvMultiWindow
      }
    }
  })

  hp.call(Vue.prototype, '$ddvMultiWindowGlobal') || Object.defineProperty(Vue.prototype, '$ddvMultiWindowGlobal', {
    get: () => this
  })
}
function optionsInstall () {
  this.options = unDefDefaultByObj((this.options || {}), {
    // 命名空间
    namespace: '__DDV_MULTI_WINDOW__'
  })
}

function namespaceReg (name) {
  name = name || this.options.namespace
  if (!this.contentWindow[name]) {
    this.contentWindow[name] = this
  }
}
function daemonWindowInstall () {
  if (!this.options.window) {
    // 如果传入窗口，试图自动获取
    this.options.window = typeof window === void 0 ? this.options.window : window
  }
  // 获取窗口
  this.contentWindow = getWindow(this.options.window)
  this.daemonWindow = getDaemonWindow(this.contentWindow)
  this.isDaemon = this.contentWindow ? this.contentWindow === this.daemonWindow : true
  try {
    if (this.contentWindow) {
      if (!this.contentWindow.$ddvUtil) {
        this.contentWindow.$ddvUtil = {}
      }
      this.contentWindow.$ddvUtil.$daemonWindow = this.daemonWindow
    }
  } catch (e) {
    warn(false, '守护窗口保存失败')
  }
}
function mapInstall () {
  if (this.map) {
    return
  }
  if (this.contentWindow === this.daemonWindow) {
    this.map = Object.create(null)
  } else if (this.daemonWindow && this.daemonWindow[this.namespace]) {
    this.map = this.daemonWindow[this.namespace].map || this.map
  }
  if (!this.map) {
    throw getError('Initialization failed, check if the \'options.namespace\' is consistent with the daemon window')
  }
  // this.$Vue.util.defineReactive(this.$Vue.prototype, 'ddvMultiWindowGlobalMap', this.map)
}
Object.assign(ps, {
  $isServer () {
    return this.$Vue ? this.$Vue.prototype.$isServer : null
  },
  $Vue: [function () {
    return this._Vue ? this._Vue : null
  }, function (value) {
    return (this._Vue = value)
  }],
  namespace: [function () {
    return this.options && this.options.namespace
  }, function (value) {
    this.options = this.options || Object.create(null)
    return (this.options.namespace = value)
  }]
})

function setDdvMultiWindow (input) {
  DdvMultiWindow = input
}
function DdvMultiWindowGlobal () {}

Object.keys(ps).forEach(key => {
  if (hp.call(DdvMultiWindowGlobal.prototype, key)) {
    return
  }
  const item = ps[key]
  if (isFunction(item)) {
    Object.defineProperty(dp, key, { get: item })
  } else if (Array.isArray(item)) {
    const obj = {}
    if (isDef(item[0]) && isFunction(item[0])) {
      obj.get = item[0]
    }
    if (isDef(item[1]) && isFunction(item[1])) {
      obj.set = item[1]
    }
    Object.defineProperty(dp, key, obj)
  }
})

const install = global.install
export let DdvMultiWindow
export {
  global,
  install,
  setDdvMultiWindow,
  global as default
}
