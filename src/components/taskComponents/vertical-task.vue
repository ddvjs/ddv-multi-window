<template></template>

<script>
export default {
  name: 'vertical-task',
  props: {
    task: {
      type: Object
    },
    process: {
      type: Object,
      default: {}
    },
    handleTask: {
      type: Function
    },
    taskOptions: {
      type: Object
    }
  },
  computed: {
    taskId () {
      return this.task ? this.task.id : null
    },
    activeId () {
      return this.task ? this.task.activeId : null
    },
    pids () {
      return this.task ? this.task.pids : []
    },
    dragData () {
      return this.$ddvMultiWindow.dragData || {}
    },
    taskMenuStyle () {
      const style = {}

      if (this.taskOptions.menuStyle && typeof this.taskOptions.menuStyle === 'object') {
        const keys = Object.keys(this.taskOptions.menuStyle)
        keys.forEach(key => {
          if (this.taskOptions.menuStyle[keys] || this.taskOptions.menuStyle[keys] === 0) {
            style[key] = this.taskOptions.menuStyle[keys]
          }
        })
      }
      return style
    }
  },
  data () {
    return {
      tabTaskLiLists: {},
      isLeave: false,
      isShowDropdown: false
    }
  },
  mounted () {
    console.warn('not supported vertical mode yet')
  }
}
</script>

