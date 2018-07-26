export default {
  methods: {
    // 打开前钩子事件
    onBeforeOpen (fn) {
      return registerHook(this.beforeOpenHooks, fn)
    },
    // 打开后钩子事件
    onOpened (fn) {
      return registerHook(this.openedHooks, fn)
    },
    // 移除前钩子事件
    onBeforeRemove (fn) {
      return registerHook(this.beforeRemoveHooks, fn)
    },
    // 更新前前钩子事件
    onBeforeRefres (fn) {
      return registerHook(this.beforeRefresHooks, fn)
    },
    // 更新后钩子事件
    onRefreshed (fn) {
      return registerHook(this.refreshedHooks, fn)
    },
    onReady (cb, errorCb) {
      this.readyCbs.push(cb)
      errorCb && this.errorHooks.push(errorCb)
      return () => {
        const i = this.readyCbs.indexOf(cb)
        const ie = this.errorHooks.indexOf(errorCb)
        if (i > -1) this.readyCbs.splice(i, 1)
        if (ie > -1) this.errorHooks.splice(ie, 1)
      }
    },
    onError (errorCb) {
      return registerHook(this.errorHooks, errorCb)
    }
  },
  beforeCreate () {
    this.readyCbs = []
    this.errorHooks = []
    this.openedHooks = []
    this.refreshedHooks = []
    this.beforeOpenHooks = []
    this.beforeRemoveHooks = []
    this.beforeRefresHooks = []
  }
}

function registerHook (list, fn) {
  list.push(fn)
  return () => {
    const i = list.indexOf(fn)
    if (i > -1) list.splice(i, 1)
  }
}
