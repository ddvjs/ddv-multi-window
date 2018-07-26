import clone from '../util/clone'
import cloneRenderOptions from '../util/clone-render-options'

export default {
  name: 'ddv-multi-window-button',
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    tag: {
      type: String,
      default: 'button'
    },
    daemonId: {
      type: [Number, String],
      default: 'daemon'
    },
    taskId: {
      type: [Number, String],
      default: ''
    },
    event: {
      type: [String, Array],
      default: 'click'
    }
  },
  data () {
    return {
      ddvMultiWindowReady: false,
      error: null
    }
  },
  render (h) {
    const on = { click: guardEvent }
    if (Array.isArray(this.event)) {
      this.event.forEach(e => { on[e] = this.handler.bind(this) })
    } else {
      on[this.event] = this.handler.bind(this)
    }

    return h(this.tag, { on }, this.$slots.default)
  },
  methods: {
    masterInit () {
      // master进程的id
      this.$ddvMultiWindowGlobal.masterInit(this)
        .then(() => {
          this.$ddvMultiWindow.onDaemonClose = this.onDaemonClose.bind(this)
          // 标记初始化完毕
          this.ddvMultiWindowReady = true
        }, e => {
          console.error(e)
          this.error = e
        })
    },
    handler (e) {
      if (guardEvent(e)) {
        const target = e.currentTarget.getAttribute('target')
        const taskId = target || this.taskId
        const options = cloneRenderOptions(typeof this.to === 'string' ? { src: this.to } : clone(this.to), {
          taskId
        })
        if (this.ddvMultiWindowReady) {
          this.$ddvMultiWindow.open(options)
        } else {
          return this.$ddvMultiWindowGlobal.masterInit(this)
            .then(() => {
              this.$ddvMultiWindow.open(options)
            })
        }
      }
    }
  },
  created () {
    this.$isServer || this.masterInit()
  }
}

function guardEvent (e) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return
  // don't redirect when preventDefault called
  if (e.defaultPrevented) return
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) {
    e.preventDefault()
  }
  return true
}
