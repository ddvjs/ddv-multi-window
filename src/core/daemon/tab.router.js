export default {
  methods: {
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
