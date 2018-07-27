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
  resolve (...opts) {
    return this.$parentRouter.resolve.apply(this.$parentRouter, opts)
  },
  init (vm, a, b) {
    vm._route = this.process.route
    this.vm = vm
    this.history = {}
    this.history.current = this.process.route
  },
  push (location, onComplete, onAbort) {
    this.vm.$ddvMultiWindow.open(location)
    // this.$parentRouter.push('/#44')
  },
  replace (location, onComplete, onAbort) {
    console.log('location, onComplete, onAbort', location, onComplete, onAbort)
  }
}
