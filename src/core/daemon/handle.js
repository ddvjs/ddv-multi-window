import sleep from '../../util/sleep'
import findRefOrSleepCall from '../../util/find-or-sleep-call'
import DdvMultiWindow from '../../api'
const $ = require('jquery')

export default {
  methods: {
    dmw$iframeLoad (id, isReload) {
      var process
      if (!(id && (process = this.process[id]))) {
        return Promise.resolve()
      }
      if (process.mode !== 'iframe' || process.removeing) {
        return Promise.resolve()
      }
      return Promise.resolve()
        .then(() => {
          if (!process.$iframe) {
            return findRefOrSleepCall(this.$refs, 'if_' + id)
              .then(ref => {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                process.$iframe = $(ref)
              })
          }
        })
        .then(() => {
          if (isReload || !process.contentWindow || process.contentWindow.closed) {
            process.contentWindow = (process.$iframe[0] && process.$iframe[0].contentWindow) || null
            if (!process.contentWindow || process.contentWindow.closed) {
              return sleep(500).then(_ => this.dmw$iframeLoad(id, true))
            }
          }
        })
    },
    dmw$mainWrapInit (id) {
      var process
      if (!(id && (process = this.process[id]))) {
        return Promise.resolve()
      }
      if (process.removeing || !process.isHasView) {
        return Promise.resolve()
      }
      return Promise.all((this.taskIds || []).map(taskId => {
        process.$mainWrap || this.$set(process, '$mainWrap', {})
        if (!process.$mainWrap[taskId]) {
          return findRefOrSleepCall(this.$refs, 'mc_' + taskId + '_p_' + id)
            .then(ref => {
              ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
              process.$mainWrap[taskId] = $(ref)
            })
        }
      }))
    },
    dmw$viewInit (id) {
      var process
      if (!(id && (process = this.process[id]))) {
        return Promise.resolve()
      }
      if (process.removeing || !process.isHasView) {
        return Promise.resolve()
      }
      if (process.refinit) {
        return this.dmw$mainWrapInit(id)
      }
      return Promise.resolve()
        .then(() => {
          if (!process.$parent) {
            return findRefOrSleepCall(this.$refs, 'vp_' + id)
              .then(ref => {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                process.$parent = $(ref)
              })
          }
        })
        .then(() => {
          if (!process.$content) {
            return findRefOrSleepCall(this.$refs, 'vb_' + id)
              .then(ref => {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                process.$content = $(ref)
              })
          }
        })
        .then(() => this.dmw$mainWrapInit(id))
        .then(() => {
          // 初始化完毕
          process.refinit = true
          if (process.mode === 'iframe') {
            process.init = true
            return this.dmw$iframeLoad(id)
          } else if (process.mode === 'component') {
            return this.loadComponent(id)
              .then(() => {
                process.init = true
              })
              .catch(error => {
                process.error = error
              })
          }
        })
        .then(() => {
          process.init = true
        })
        .then(() => {
          // 移动窗口到
          return this.$ddvMultiWindow.windowAppendChild({
            id,
            taskId: process.taskId
          })
        })
    },
    dmw$taskInit (id) {
      var process
      if (!(id && (process = this.process[id]))) {
        return
      }
      if (process.refinit || process.removeing || !process.isTask) {
        return
      }
      return Promise.resolve()
        .then(() => {
          if (!process.$taskParent) {
            return findRefOrSleepCall(this.$refs, 'tp_' + id)
              .then(ref => {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                process.$taskParent = $(ref)
              })
          }
        })
        .then(() => {
          if (!process.$taskContent) {
            return findRefOrSleepCall(this.$refs, 'tb_' + id)
              .then(ref => {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                process.$taskContent = $(ref)
              })
          }
        })
        .then(() => {
          if (!process.$mainParent) {
            return findRefOrSleepCall(this.$refs, 'mp_' + id)
              .then(ref => {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                process.$mainParent = $(ref)
              })
          }
        })
        .then(() => {
          if (!process.$mainContent) {
            return findRefOrSleepCall(this.$refs, 'mb_' + id)
              .then(ref => {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                process.$mainContent = $(ref)
              })
          }
        })
        .then(() => {
          // 初始化完毕
          process.refinit = true
        })
    },
    dmw$processInit () {
      var promises = []
      this.pids.forEach(id => promises.push())
      return Promise.all(this.pids.map(id => {
        var process
        if (!(id && (process = this.process[id]))) {
          return Promise.resolve()
        }
        if (process.isHasView) {
          return this.dmw$viewInit(id)
        }
        if (process.isTask) {
          return this.dmw$taskInit(id)
        }
        return Promise.resolve()
      }))
    },
    dmw$ddvMultiWindowMapInit () {
      const item = this.$ddvMultiWindowGlobal.map[this.daemonId]
      return Promise.all(this.taskIds.map(taskId => {
        if (!item.api[taskId]) {
          item.api[taskId] = new DdvMultiWindow(item.app, taskId)
        }
      }).concat(Object.keys(item.api || {}).map(taskId => {
        this.taskIds.indexOf(taskId) > -1 || this.$delete(item.api, taskId)
      })))
    },
    dmw$handleContentWindowLoad () {
      return Promise.all([
        this.dmw$handleMasterWindowLoad(),
        this.dmw$handleIframeLoad()
      ])
    },
    dmw$handleMasterWindowLoad () {
      return Promise.resolve(this.pids.map(pid => {
        if (!(pid && this.process)) {
          return Promise.resolve()
        }
        const process = this.process[pid]
        if (!(process && process.hasContentWindow)) {
          return Promise.resolve()
        }
        /* 缺少清理代码 */
        return Promise.resolve()
      }))
    },
    dmw$handleIframeLoad (event, id) {
      return this.tryRun(_ => sleep(300).then(_ => this.dmw$iframeLoad(id)))
    },
    dmw$handlePidsChange () {
      // 下一进程进行 初始化窗口 加载
      return this.tryRun(_ => Promise.all([
        // this.windowWrapRefsInit(),
        this.dmw$processInit()
      ]))
    },
    dmw$handleTaskIdsChange () {
      // 下一进程进行 初始化窗口 加载
      return this.tryRun(_ => this.dmw$ddvMultiWindowMapInit())
    },
    dmw$onbeforeunload (event) {
      event.returnValue = '关闭会导致所有窗口都关闭，您确认关闭'
      return '关闭会导致所有窗口都关闭?'
    },
    dmw$handleCloseInit () {
      const cw = this.$ddvMultiWindowGlobal.contentWindow
      cw.addEventListener('close', this.closeAllMasterWindow.bind(this))
      cw.addEventListener('unload', this.closeAllMasterWindow.bind(this))
      process.env.NODE_ENV !== 'production' || cw.addEventListener('beforeunload', this.dmw$onbeforeunload.bind(this))
    }
  },
  watch: {
    taskIds: {
      handler: 'dmw$handleTaskIdsChange',
      deep: true
    },
    pids: {
      handler: 'dmw$handlePidsChange',
      deep: true
    }
  },
  mounted () {
    this.dmw$handleCloseInit()
  }
}
