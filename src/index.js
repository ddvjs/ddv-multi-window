import DdvMultiWindow, { globalInit } from './api'
import Ready from './core/ready'
import EventMessageWindow from './core/event-message-window'
import { inBrowser } from './util/dom'
import Task from './components/task.vue'
import Daemon from './components/daemon'
import Button from './components/button'
import Master from './components/master'
import DmwButton from './components/dmw-button'
import MasterTask from './components/master-task'
import MasterView from './components/master-view'
import { isDef } from './util/is-def'
import { assert, warn } from './util/warn'
import getError, { throwError } from './util/get-error'
import { unDefDefaultByObj } from './util/is-def'
import { getWindow, getDaemonWindow } from './util/window'
export let _Vue
export class DdvMultiWindowGlobal {
  constructor () {
    this.Vue = null
  }
  masterInit (app) {
    if (this.Vue.prototype.$isServer) {
      return
    }
    if (!this.installed) {
      throw getError('not installed. Make sure to call `Vue.use(DdvMultiWindow)`before creating root instance.')
    }
    if (!app) {
      throw getError('必须传入app实例')
    }
    const ddvMultiWindow = getParent(app)
    if (ddvMultiWindow) {
      return Promise.resolve(ddvMultiWindow)
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
      })
  }
  daemonInit (app) {
    if (this.Vue.prototype.$isServer) {
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
  get (daemonId, taskId, tryNumMax, tryNum) {
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
  install (Vue, options) {
    if ((this.installing || this.installed) && this.Vue === Vue) return
    // 防止多次重复安装
    this.installing = true
    // 保存当前安装的vue
    this.Vue = Vue
    // 存储配置项
    this.options = options
    // Vue安装
    this.VueInstall(Vue)
    if (Vue.prototype.$isServer) {
      // 防止多次重复安装
      this.installing = false
      // 防止多次重复安装
      this.installed = true
      // 服务端不进一步初始化
      return
    }
    // 初始化
    this.optionsInstall()
    // 初始化
    this.daemonWindowInstall()
    // 全局注册
    this.namespaceReg()
    // 存储初始化
    this.mapInstall()
    // 防止多次重复安装
    this.installing = false
    // 防止多次重复安装
    this.installed = true
  }
  mapInstall () {
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
    // this.Vue.util.defineReactive(this.Vue.prototype, 'ddvMultiWindowGlobalMap', this.map)
  }
  daemonWindowInstall () {
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
  optionsInstall () {
    this.options = unDefDefaultByObj((this.options || {}), {
      // 命名空间
      namespace: '__DDV_MULTI_WINDOW__'
    })
  }
  namespaceReg (name) {
    name = name || this.options.namespace
    if (!this.contentWindow[name]) {
      this.contentWindow[name] = this
    }
  }
  VueInstall (Vue) {
    Vue = Vue || this.Vue
    // 钩子安装
    this.hookInstall(Vue)
    // 组件安装
    this.componentInstall(Vue)
    // 继承安装
    this.VuePrototypeInstall(Vue)
    // 接口安装
    this.RegisterInstanceInstall(Vue)
  }
  hookInstall (Vue) {
    // 管理状态
    const strats = Vue.config.optionMergeStrategies
    // 对窗口挂钩使用相同的钩子合并策略
    strats.beforeDdvMultiWindowOpen = strats.ddvMultiWindowOpened = strats.beforeDdvMultiWindowRemove = strats.ddvMultiWindowRemoved = strats.beforeDdvMultiWindowRefresh = strats.ddvMultiWindowRefreshed = strats.created
  }
  componentInstall (Vue) {
    // 安装组件
    Vue.component(Task.name, Task)
    Vue.component(Daemon.name, Daemon)
    Vue.component(Button.name, Button)
    Vue.component(Master.name, Master)
    Vue.component(DmwButton.name, DmwButton)
    Vue.component(MasterTask.name, MasterTask)
    Vue.component(MasterView.name, MasterView)
  }
  RegisterInstanceInstall (Vue) {
    this.Vue.mixin({
      beforeCreate () {
        this._ddvMultiWindow = (this.$parent && this.$parent._ddvMultiWindow) || void 0
        registerInstance(this, this)
      },
      destroyed () {
        registerInstance(this)
      }
    })
  }
  VuePrototypeInstall (Vue) {
    Vue.prototype.hasOwnProperty('$ddvMultiWindow') || Object.defineProperty(Vue.prototype, '$ddvMultiWindow', {
      get () {
        if (this._ddvMultiWindow) {
          return this._ddvMultiWindow
        } else {
          throw getError('多窗口没有初始化')
        }
      }
    })
    Vue.prototype.hasOwnProperty('$ddvMultiWindowGlobal') || Object.defineProperty(Vue.prototype, '$ddvMultiWindowGlobal', {
      get: () => this
    })
  }
}
DdvMultiWindowGlobal.prototype.hasOwnProperty('namespace') || Object.defineProperty(DdvMultiWindowGlobal.prototype, 'namespace', {
  get () {
    return this.options && this.options.namespace
  },
  set (value) {
    this.options = this.options || Object.create(null)
    return (this.options.namespace = value)
  }
})
const g = Object.assign((new DdvMultiWindowGlobal()), {
  isDaemon: true,
  Ready,
  version: '__VERSION__'
})
globalInit(g)

export { g as default, getParent, Ready, EventMessageWindow }

if (inBrowser && window.Vue) {
  window.Vue.use(DdvMultiWindow)
}
function getParent (parent) {
  parent = parent || this
  if (parent && parent._ddvMultiWindow) {
    return parent._ddvMultiWindow
  }
  if (parent && parent.$parent) {
    return getParent(parent.$parent)
  } else {
    return null
  }
}
function registerInstance (vm, callVal) {
  let i = vm.$options._parentVnode
  if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerDdvMultiWindowInstance)) {
    i(vm, callVal)
  }
}
