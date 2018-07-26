import sleep from '../../util/sleep'
import getError from '../../util/get-error'
import findRefOrSleepCall from '../../util/find-or-sleep-call'
const $ = require('jquery')

export default {
  methods: {
    regTask (taskId) {
      // 试图拿到该任务栏
      const task = this.process[taskId]
      if (!task) {
        throw new Error('没有找到任务栏窗口')
      }
      if (!(task.isTask && Array.isArray(task.pids))) {
        this.$set(task, 'isTask', true)
        this.$set(task, 'pids', [])
        this.$set(task, 'history', [])
        this.$set(task, 'activeId', null)
      }
    },
    addTask ({ taskId, id }) {
      // 试图拿到该任务栏
      const pids = this.process[taskId].pids
      pids.indexOf(id) > -1 || pids.push(id)
    },
    refreshTask ({ taskId, id }) {
      (this.taskIds || []).forEach(tid => {
        const task = this.process[tid]
        if (task && tid !== taskId) {
          task.pids = task.pids.filter(pid => {
            return pid !== id
          })
          task.history = task.history.filter(pid => {
            return pid !== id
          })
        }
      })
    },
    windowAppendChild ({ id, taskId, autoToTab }, tryNum) {
      if (tryNum > 50) {
        return Promise.reject(new Error('查找失败'))
      } else {
        tryNum = (tryNum || 0) + 1
      }
      var item, taskIdLast
      if (!(id && (item = this.process[id]))) {
        return Promise.resolve()
      }
      if (item.removeing) {
        return Promise.resolve()
      }
      if (!(item.$mainWrap && item.$mainWrap[taskId])) {
        return sleep(350).then(() => this.windowAppendChild({ id, taskId, autoToTab }, tryNum))
      }
      item.$mainWrap[taskId].append(item.$content)
      taskIdLast = item.taskId
      item.taskId = taskId

      if (autoToTab === false) {
        return Promise.resolve()
      } else {
        return this.tabToWindow(id)
          .then(() => {
            this.refreshTask({ taskId, id })
            return this.tabToLastWindowByTaskId(taskIdLast || 'daemon')
          })
      }
    },
    viewMoveParentByPid (id) {
      const process = this.process[id]
      if (process && process.$parent && process.$parent.length && process.$content && process.$content.length) {
        process.$parent.append(process.$content)
      }
    },
    closeMasterWindow (taskId, isCloseMaster) {
      const task = this.process[taskId || 'daemon']
      if (!task) {
        return
      }
      this.masterMoveParentByTaskId(taskId)
      if (isCloseMaster === true) {
        const taskDaemon = this.process.daemon
        const activeId = task.activeId
        if (task.mode !== 'master') {
          return
        }
        (task.history || []).forEach(id => {
          taskDaemon.history.indexOf(id) > -1 || taskDaemon.history.push(id)
        })
        return Promise.all((task.pids || []).map(id => {
          this.addTask({ taskId: 'daemon', id })
          return this.windowAppendChild({ taskId: 'daemon', id, autoToTab: false })
        }))
          .then(() => {
            task.pids.length = 0
            return this.refreshTask({ taskId: 'daemon', id: activeId })
          })
      } else if (isCloseMaster === void 0) {
        clearTimeout(task.closeMasterTimer)
        task.closeMasterTimer = setTimeout(() => {
          this.closeMasterWindow(taskId, true)
        }, 5000)
      }
    },
    closeAllMasterWindow () {
      const item = this.$ddvMultiWindowGlobal && this.$ddvMultiWindowGlobal.map && this.$ddvMultiWindowGlobal.map[this.daemonId] && this.$ddvMultiWindowGlobal.map[this.daemonId].api
      this.taskIds.forEach(taskId => {
        Object.keys(item).forEach(taskId => {
          item && item[taskId] && typeof item[taskId].onDaemonClose === 'function' && item[taskId].onDaemonClose()
        })
      })
    },
    masterMoveParentByTaskId (taskId) {
      const task = taskId && this.process[taskId]
      if (!task) {
        return
      }
      if (task.$mainParent && task.$mainContent) {
        task.$mainParent.append(task.$mainContent)
      }
      if (task.$taskParent && task.$taskContent) {
        task.$taskParent.append(task.$taskContent)
      }
    },
    masterViewInit (view, taskId, $wrap) {
      const task = this.process[taskId]
      let mountKey
      if (view === 'view') {
        mountKey = '$mainContent'
      } else if (view === 'task') {
        mountKey = '$taskContent'
      }
      if (!task) {
        return Promise.reject(getError('进程不存在'))
      }
      clearTimeout(task.closeMasterTimer)
      if (!task[mountKey]) {
        return findRefOrSleepCall(task, mountKey).then(() => this.masterViewInit(view, taskId, $wrap))
      }
      if (!task[mountKey].length) {
        return Promise.reject(getError('任务栏中没有找到挂载点'))
      }
      if (!($wrap && $($wrap).length)) {
        return Promise.reject(getError('进程不存在'))
      }
      $wrap.append(task[mountKey])
      return Promise.resolve()
    }
  }
}
