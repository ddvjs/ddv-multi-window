import getError from '../../util/get-error'
import { openWindow } from '../../util/window'
import removeArray from '../../util/remove-array'
export default {
  methods: {
    // 切换窗口
    tabToWindow (pid) {
      if (!this.isHasId(pid)) {
        return Promise.reject(getError('窗口不存在'))
      }
      // 取得任务栏 - 先试图从该窗口进程中找到任务栏id，如果没有就是有默认任务栏
      const task = this.process[this.process[pid].taskId || 'daemon']
      // 任务栏中把激活的窗口id设为传入id
      task.activeId = pid
      // 任务栏 的 历史 中 去除这个 id
      removeArray(task.history, item => item === pid)
      // 把这个id 插入到历史的最前方
      task.history.unshift(pid)
      return Promise.resolve()
    },
    // 切换窗口
    tabToLastWindowByTaskId (taskId) {
      var task = this.process[taskId || 'daemon']
      if (taskId !== 'daemon' && !(task.pids && task.pids.length)) {
        return this.closeMasterWindow(taskId, 0) || Promise.resolve()
      }
      // 获取上一个历史的id
      return task && task.history[0] && this.tabToWindow(task.history[0])
    },
    tabMoveMasterWindow ({ taskId, id }) {
      this.regTask(taskId)
      this.addTask({ taskId, id })
      return this.windowAppendChild({ taskId, id })
    },
    openMasterWindow (id) {
      try {
        const taskId = this.createPid({ mode: 'master' })
        const contentWindow = openWindow(this.openMasterWindowSrc, {
          name: taskId
        }, this.daemonWindow || this.contentWindow)
        this.processPut({
          id: taskId,
          mode: 'master',
          isTask: true,
          isHasView: false,
          hasContentWindow: true,
          contentWindow
        })
        return this.tabMoveMasterWindow({ id, taskId })
      } catch (e) {
        return Promise.reject(e)
      }
    }
  }
}
