import getDdvMultiWindowByParent from './util/get-ddv-multi-window-by-parent'

export default {
  data () {
    return {
      ddvMultiWindowReady: false,
      error: null,
      pid: null,
      type: null
    }
  },
  props: {
    daemonId: {
      type: [Number, String],
      default: 'daemon'
    }
  },
  beforeCreate () {
    if (!this._ddvMultiWindow) {
      this._ddvMultiWindow = getDdvMultiWindowByParent(this) || this._ddvMultiWindow
    }
    console.log('beforeCreate', this._ddvMultiWindow)
  },
  created () {
    console.log('beforeCreate', this)
    // master进程的id
    this.$ddvMultiWindowGlobal.masterInit(this)
      .then(pid => {
        console.log('pid====pid', pid)
        // 进程id
        this.pid = pid
        // 标记初始化完毕
        this.ddvMultiWindowReady = true
      }, e => {
        console.log(e)
        this.error = e
      })
    console.log('created', this)
  }
}
