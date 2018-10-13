export default {
  methods: {
    handleTask (event, type, id) {
      return this.$ddvMultiWindow.tryRun(() => {
        return this['handleTask$' + type](event, id)
      })
    },
    // 当标签被点击的时候
    handleTask$click (event, pid) {
      event.stopPropagation()
      // 注意禁止浏览器默认事件
      event.preventDefault()
      return this.$ddvMultiWindow.tabToWindow(pid)
    },
    // 刷新一个tab窗口
    handleTask$refresh (event, pid) {
      event.stopPropagation()
      // 注意禁止浏览器默认事件
      event.preventDefault()
      return this.$ddvMultiWindow.refresh(pid)
    },
    // 移除一个tab窗口
    handleTask$openMasterWindow (event, pid) {
      event.stopPropagation()
      // 注意禁止浏览器默认事件
      event.preventDefault()
      return this.$ddvMultiWindow.openMasterWindow(pid)
    },
    // 移除一个tab窗口
    handleTask$remove (event, pid) {
      event.stopPropagation()
      // 注意禁止浏览器默认事件
      event.preventDefault()
      return this.$ddvMultiWindow.remove(pid)
    },
    // 移除所有tab窗口
    handleTask$removeAll (event, taskId) {
      event.stopPropagation()
      // 注意禁止浏览器默认事件
      event.preventDefault()
      var closePromises = []

      if (Array.isArray(this.process[taskId].pids)) {
        this.process[taskId].pids.forEach(
          pid =>
            this.process[pid] && this.process[pid].closable !== false &&
          closePromises.push(this.$ddvMultiWindow.remove(pid))
        )
      }
      return Promise.all(closePromises)
    },
    // 右键一个tab窗口
    handleTask$contextMenu (event, pid) {
      event.stopPropagation()
      // 注意禁止浏览器默认事件
      event.preventDefault()
      console.log('右键')
    }
  }
}
