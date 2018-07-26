import sleep from '../../util/sleep'
import findRefOrSleepCall from '../../util/find-or-sleep-call'
import DdvMultiWindow from '../../api'
const $ = require('jquery')

export default {
  methods: {
    dmw$iframeLoad (id, isReload) {
      var item
      if (!(id && (item = this.process[id]))) {
        return Promise.resolve()
      }
      if (item.mode !== 'iframe' || item.removeing) {
        return Promise.resolve()
      }
      return Promise.resolve()
        .then(() => {
          if (!item.$iframe) {
            return findRefOrSleepCall(this.$refs, 'if_' + id)
              .then(ref => {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                item.$iframe = $(ref)
              })
          }
        })
        .then(() => {
          if (isReload || !item.contentWindow || item.contentWindow.closed) {
            item.contentWindow = (item.$iframe[0] && item.$iframe[0].contentWindow) || null
            if (!item.contentWindow || item.contentWindow.closed) {
              return sleep(500).then(_ => this.dmw$iframeLoad(id, true))
            }
          }
        })
    },
    dmw$mainWrapInit (id) {
      var item
      if (!(id && (item = this.process[id]))) {
        return Promise.resolve()
      }
      if (item.removeing || !item.isHasView) {
        return Promise.resolve()
      }
      return Promise.all((this.taskIds || []).map(taskId => {
        item.$mainWrap || this.$set(item, '$mainWrap', {})
        if (!item.$mainWrap[taskId]) {
          return findRefOrSleepCall(this.$refs, 'mc_' + taskId + '_p_' + id)
            .then(ref => {
              ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
              item.$mainWrap[taskId] = $(ref)
            })
        }
      }))
    },
    dmw$viewInit (id) {
      var item
      if (!(id && (item = this.process[id]))) {
        return Promise.resolve()
      }
      if (item.removeing || !item.isHasView) {
        return Promise.resolve()
      }
      if (item.refinit) {
        return this.dmw$mainWrapInit(id)
      }
      return Promise.resolve()
        .then(() => {
          if (!item.$parent) {
            return findRefOrSleepCall(this.$refs, 'vp_' + id)
              .then(ref => {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                item.$parent = $(ref)
              })
          }
        })
        .then(() => {
          if (!item.$content) {
            return findRefOrSleepCall(this.$refs, 'vb_' + id)
              .then(ref => {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                item.$content = $(ref)
              })
          }
        })
        .then(() => this.dmw$mainWrapInit(id))
        .then(() => {
          // 初始化完毕
          item.refinit = true
          if (item.mode === 'iframe') {
            item.init = true
            return this.dmw$iframeLoad(id)
          } else if (item.mode === 'component') {
            return this.loadComponent(id)
              .then(() => {
                item.init = true
              })
              .catch(error => {
                item.error = error
              })
          }
        })
        .then(() => {
          item.init = true
        })
        .then(() => {
          // 移动窗口到
          return this.$ddvMultiWindow.windowAppendChild({
            id,
            taskId: item.taskId
          })
        })
    },
    dmw$taskInit (id) {
      var item
      if (!(id && (item = this.process[id]))) {
        return
      }
      if (item.refinit || item.removeing || !item.isTask) {
        return
      }
      return Promise.resolve()
        .then(() => {
          if (!item.$taskParent) {
            return findRefOrSleepCall(this.$refs, 'tp_' + id)
              .then(ref => {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                item.$taskParent = $(ref)
              })
          }
        })
        .then(() => {
          if (!item.$taskContent) {
            return findRefOrSleepCall(this.$refs, 'tb_' + id)
              .then(ref => {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                item.$taskContent = $(ref)
              })
          }
        })
        .then(() => {
          if (!item.$mainParent) {
            return findRefOrSleepCall(this.$refs, 'mp_' + id)
              .then(ref => {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                item.$mainParent = $(ref)
              })
          }
        })
        .then(() => {
          if (!item.$mainContent) {
            return findRefOrSleepCall(this.$refs, 'mb_' + id)
              .then(ref => {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref
                item.$mainContent = $(ref)
              })
          }
        })
        .then(() => {
          // 初始化完毕
          item.refinit = true
        })
    },
    dmw$processInit () {
      var promises = []
      this.pids.forEach(id => promises.push())
      return Promise.all(this.pids.map(id => {
        var item
        if (!(id && (item = this.process[id]))) {
          return Promise.resolve()
        }
        if (item.isHasView) {
          return this.dmw$viewInit(id)
        }
        if (item.isTask) {
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
