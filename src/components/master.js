import LoadComponent from './load'
import ErrorComponent from './error'
import findRefOrSleepCall from '../util/find-or-sleep-call'

const $ = require('jquery')
export {
  getOptions
}
export default getOptions()
function getOptions(name, view) {
  return {
    name: name || 'ddv-multi-window-master',
    props: {
      daemonId: {
        type: [Number, String],
        default: 'daemon'
      },
      view: {
        type: String,
        default: view || 'view'
      },
      autoColse: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        ddvMultiWindowReady: false,
        refReady: false,
        error: null,
        init: false,
        wrap: null,
        $wrap: null
      }
    },
    render (h) {
      const children = []
      if (this.error) {
        children.push(h(ErrorComponent, {
          key: 'error',
          attrs: {
            'ddv-multi-window-type': 'errorBox'
          },
          props: {
            view: this.view,
            error: this.error
          }
        }))
      } else if (!this.init) {
        children.push(h(LoadComponent, {
          key: 'load'
        }))
      }
      return h('div', {
        key: 'master',
        ref: 'm',
        attrs: {
          id: 'dmw_master_' + this.view + this.daemonId,
          'ddv-multi-window-type': 'master' + this.view
        }
      }, children)
    },
    methods: {
      masterInit () {
        // master进程的id
        this.$ddvMultiWindowGlobal.masterInit(this)
          .then(() => {
            console.log(996,this.$ddvMultiWindow)
            this.$ddvMultiWindow.onDaemonClose = this.onDaemonClose.bind(this)
            // 标记初始化完毕
            this.ddvMultiWindowReady = true
          }, e => {
            console.error(e)
            this.error = e
          })
      },
      refReadyInit () {
        return Promise.resolve()
          .then(() => {
            if (!this.wrap) {
              return findRefOrSleepCall(this.$refs, 'm')
                .then(ref => {
                  ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                  this.wrap = ref
                  this.$wrap = $(this.wrap)
                })
            }
          }).then(() => {
            this.refReady = true
          })
      },
      closeWindow () {
        try {
          this.contentWindow.close()
        } catch (e) {
          try {
            window.close()
          } catch (e) { }
        }
      },
      closeMasterWindow () {
        try {
          this.$ddvMultiWindow.closeMasterWindow(this.taskId, 5000)
        } catch (e) {
          this.closeWindow()
        }
      },
      masterViewInit () {
        if (this.masterReady) {
          const cw = this.contentWindow
          cw.addEventListener('close', this.closeMasterWindow.bind(this))
          cw.addEventListener('unload', this.closeMasterWindow.bind(this))
          this.$ddvMultiWindow.masterViewInit(this.view, this.taskId, this.$wrap)
            .then(() => {
              this.init = true
            })
        }
      },
      onDaemonClose () {
        this.$ddvMultiWindow.masterMoveParentByTaskId(this.taskId)
        this.error = new Error('主窗口被关闭')
        this.autoColse && setTimeout(() => {
          this.closeWindow()
        }, 1500)
      }
    },
    computed: {
      taskId () {
        return this.ddvMultiWindowReady ? this.$ddvMultiWindow.taskId : null
      },
      contentWindow () {
        return this.$ddvMultiWindowGlobal.contentWindow
      },
      masterReady () {
        return this.refReady && this.ddvMultiWindowReady
      }
    },
    watch: {
      masterReady: {
        handler: 'masterViewInit'
      }
    },
    created () {
      this.$isServer || this.masterInit()
    },
    mounted () {
      this.$isServer || this.refReadyInit()
    }
  }
}
