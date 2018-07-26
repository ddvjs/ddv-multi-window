export default {
  methods: {
    loadComponentRouter (process) {
      var router = Object.create(null)

      Object.assign(router, tabRouter, {
        $parentRouter: this.$router,
        process,
        options: this.$router.options
      })
      return router
    }
  }
}
const tabRouter = {
  resolve (...a) {
    return this.$parentRouter.resolve.apply(this.$parentRouter, a)
  },
  init (vm, a, b) {
    vm._route = this.process.route
    this.$ddvMultiWindow = vm.$ddvMultiWindow
    this.history = {}
    this.history.current = this.process.route
  },
  push (location, onComplete, onAbort) {
    this.$ddvMultiWindow.open(location)
    // this.$parentRouter.push('/#44')
  },
  replace (location, onComplete, onAbort) {
    console.log('location, onComplete, onAbort', location, onComplete, onAbort)
  }
}
