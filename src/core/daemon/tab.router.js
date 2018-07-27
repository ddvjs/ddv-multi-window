import { throwError } from '../../util/get-error'

export default {
  methods: {
    loadComponent (pid) {
      const process = this.process[pid]
      // 判断该进程id是否是 一个有视图的进程
      if (!process || !process.isHasView) {
        // 既然没有视图，不需要渲染
        return throwError('不支持显示')
      }
      if (process.mode !== 'component') {
        return throwError('不支持加载')
      }

      process.error = null
      return this.routerReady()
        .then(() => (this.$router.getMatchedComponents(process.src)))
        .then(matchedComponents => {
          // 没有页码
          if (!matchedComponents.length) {
            const e = new Error('404')
            e.statusCode = 404
            return Promise.reject(e)
          }
          return Promise.all(matchedComponents.map(Component => {
            return Component()
          }))
        })
        .then(components => {
          // 窗口新的空组件
          process.component = Object.create(components[0])
          // 注入 process 数据
          process.component.process = process
          // 注入路由
          process.component.router = this.loadComponentRouter(process, process.component)
        })
        .catch(e => {
          // 报错
          process.error = e
        })
    },
    loadComponentRouter (process, component) {
      var router = Object.create(null)

      Object.assign(router, tabRouter, {
        daemonApp: this,
        $parentRouter: this.$router,
        process,
        options: this.$router.options
      })
      return router
    }
  }
}
const tabRouter = {
  resolve (...opts) {
    return this.$parentRouter.resolve.apply(this.$parentRouter, opts)
  },
  init (vm, a, b) {
    vm._route = this.process.route
    this.$vm = vm
    this.history = {}
    this.history.current = this.process.route
  },
  push (location, onComplete, onAbort) {
    if (this.$vm.$ddvMultiWindow) {
      this.$vm.$ddvMultiWindow.open(location)
    } else {
      return this.daemonApp.$ddvMultiWindowGlobal.get(this.process.daemonId, this.process.taskId)
        .then(ddvMultiWindow => ddvMultiWindow.open(location))
    }
    // this.$parentRouter.push('/#44')
  },
  replace (location, onComplete, onAbort) {
    console.log('location, onComplete, onAbort', location, onComplete, onAbort)
  }
}
