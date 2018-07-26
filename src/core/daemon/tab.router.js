export default {
  methods: {
    loadComponentRouter () {
      console.log(8888, this)
      var router = Object.create(this.$router)
      Object.assign(router, tabRouter, {
        $parentRouter: this.$router
      })
      return router
    }
  }
}
const tabRouter = {
  init (vm, a, b) {
    this.$ddvMultiWindow = vm.$ddvMultiWindow
    console.log('init 3343', vm.$ddvMultiWindow)
    return

    // 这个就是ddvTabView 实例
    this.ddvTabView = vm.$parent
    this.history = Object.create(this.history)
    console.log(this.history)
    this.history.current = this.resolve(this.ddvTabView.windowSrc).route
  },
  push (location, onComplete, onAbort) {
    this.$ddvMultiWindow.open(location)
    // this.$parentRouter.push()
    console.log('44-push-4location, onComplete, onAbort', location, onComplete, onAbort)
  },
  replace (location, onComplete, onAbort) {
    console.log('444location, onComplete, onAbort', location, onComplete, onAbort)
  }
}
