export default {
  data () {
    return {
      // 拖拽id
      dragData: {
        id: null
      },
      // 进程键值对
      process: {}
    }
  },
  computed: {
    // 初始化完毕
    ready () {
      return this.process.daemon.init
    },
    // 所有进程id集合
    pids () {
      return Object.keys(this.process || {}) || []
    },
    // 任务栏进程id集合
    taskIds () {
      return this.pids.filter(pid => (this.process[pid] && this.process[pid].isTask))
    },
    // 视图进程id集合
    viewIds () {
      return this.pids.filter(pid => (this.process[pid] && this.process[pid].isHasView))
    },
    // 拖动中的进程
    dragProcess () {
      return this.dragId ? (this.process[this.dragId] || null) : null
    }
  },
  created () {
    // 注入进程
    this.processPut({
      id: 'daemon',
      mode: 'daemon',
      isTask: true,
      isHasView: false,
      hasContentWindow: true,
      contentWindow: this.$ddvMultiWindowGlobal.contentWindow
    })
    // 守护进程的id
    this.$ddvMultiWindowGlobal.daemonInit(this)
    // 设为初始化完毕
    this.process.daemon.init = true
  }
}
