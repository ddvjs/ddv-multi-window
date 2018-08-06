<template>
  <ul
    class="tabTask vertical-task clearfix"
    ref="tabTaskWrap"
    :style="taskMenuStyle"
    @dragover.stop="handleTabWrapDragOver($event, null)"
    @dragleave.stop="handleTabWrapDragLeave($event)"
    @drop.stop="handleTabWrapDrop($event, null)">
    <li
      class="vertical-task-menu__li"
      :class="{
        'vertical-task-menu__atcive': id === activeId
      }"
      ref="tabTask"
      :key="id"
      :processid="id"
      v-if="id && process[id]"
      v-for="id in pids"
      draggable="true"
      @click="handleTask($event, 'click', id)"
      @contextmenu="handleTask($event, 'contextMenu', id)"
      @drop.stop="handleTabWrapDrop($event, id)"
      @dragstart.stop="handleTabDragStart($event, id)"
      @dragover.stop="handleTabWrapDragOver($event, id)"
      @dragend.stop="handleTabDragEnd($event, id)">
      <div class="tabTask-menu__item">
        {{process[id].title}}
      </div>
      <div class="tabTask-menu__handle">
        <div class="inline-block" @click.stop="handleTask($event, 'openMasterWindow', id)">
          <i class="dmw-icon icon-new-window f14"></i>
        </div>
        <div v-if="process[id].refreshable !== false" class="inline-block" @click="handleTask($event, 'refresh', id)">
          <i class="dmw-icon icon-refresh f14"></i>
        </div>
        <div v-if="process[id].closable!==false" class="inline-block" @click="handleTask($event, 'remove', id)">
          <i class="dmw-icon icon-close f14"></i>
        </div>
      </div>
    </li>
  </ul>
</template>

<script>
import ref$ from '../../util/ref-to-jquery'
import removeArray from '../../util/remove-array'

export default {
  name: 'horizontal-task',
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
  methods: {
    setInfo (event) {
      const $tabTaskWrap = ref$(this.$refs.tabTaskWrap)
      const len = this.pids.length

      this.dragData.event = event
      this.dragData.interval = []

      if (this.dragData.$dom && this.dragData.$dom.length) {
        this.dragData.activeHeight = this.dragData.$dom.innerHeight() || this.dragData.activeHeight || 0
      } else {
        this.dragData.activeHeight = this.dragData.activeHeight || 0
      }
      this.dragData.marginTop = 0
      this.dragData.$dom.attr('dmwDrag', '1')
      var placeholder = 0

      for (let i = 0; i < len; i++) {
        const $li = ref$('[processid="' + this.pids[i] + '"]', this.$refs.tabTask)
        const marginTop = Number($li.css('margin-top').split('px')[0])
        const marginBottom = Number($li.css('margin-bottom').split('px')[0])
        const offset = $li.offset()
        const isHide = $li.is('[dmwDrag="1"]')
        const obj = {}
        this.dragData.marginTop += marginTop
        // 实际显示位置
        if (isHide) {
          placeholder = $li.innerHeight() + marginTop - marginBottom
        } else {
          obj.startY = offset.top + marginTop - placeholder
          obj.endY = offset.top + $li.innerHeight() + marginTop - marginBottom - placeholder
          obj.pid = this.pids[i]
          this.dragData.interval.push(obj)
        }
      }
      // 上边距的平均值
      this.dragData.marginTop = Math.round(this.dragData.marginTop / len)
      // bar
      this.dragData.barStartX = $tabTaskWrap.offset().left
      this.dragData.barEndX = this.dragData.barStartX + $tabTaskWrap.outerWidth()
    },
    reduction () {
      ref$('[active="active"]', this.$refs.tabTask)
        .css('margin-top', `${this.dragData.marginTop}px`)
        .removeAttr('active')
    },
    // tab标签 - 开始拖动源对象
    handleTabDragStart (event, pid) {
      const process = this.process[pid]
      const $tabTask = ref$(this.$refs.tabTask)
      this.dragData.$dom = $tabTask.closest(event.target)
      ref$(this.$refs.tabTask)
        .addClass('transition')
      this.setInfo(event)
      this.dragData.id = pid
      this.dragData.ing = true
      this.dragData.taskId = this.taskId
      // 原始taskId
      this.dragData.rootTaskId = this.taskId
      // 是否有跨窗口
      this.dragData.isCross = false

      event.ddvCmsTaskWindowId = pid
      // 保存数据--该img元素的id
      event.dataTransfer.dropEffect = 'move'
      event.dataTransfer.effectAllowed = 'linkMove'
      event.dataTransfer.setData('ddvCmsDrag', JSON.stringify({
        'type': 'tabTask',
        'data': {
          windowId: pid
        }
      }))
      event.dataTransfer.setData('text/plain', process.href || process.src)
    },
    // tab标签 - 拖动结束
    handleTabDragEnd (event, pid) {
      if (this.dragData.ing !== true) {
        return
      }
      this.dragData.ing = false
      ref$(this.$refs.tabTask)
        .removeClass('transition')
      this.activeEvent = null
      this.dragData.id = null
      this.reduction()
      this.dragData.$dom.removeAttr('dmwDrag').fadeIn()

      if (this.dragData.taskId === this.taskId && !(event.pageX >= this.dragData.barStartX && event.pageX <= this.dragData.barEndX - 2)) {
        return this.$ddvMultiWindow.tryRun(() =>
          this.$ddvMultiWindow.openMasterWindow(pid)
            .catch(e => {
              if (e.name === 'OPEN_WINDOW_FAIL') {
                return this.$confirm('你是否要在新窗口打开', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                })
                  .then(() => this.$ddvMultiWindow.openMasterWindow(pid), e => {})
              } else {
                return Promise.reject(e)
              }
            })
        )
      }
    },
    // tab标签 - 在目标区域拖拽
    handleTabWrapDragOver (event, dropId) {
      if (this.dragData.ing !== true) {
        return
      }
      // 注意禁止浏览器默认事件
      event.preventDefault()
      const $tabTask = ref$(this.$refs.tabTask)
      // const $menuArrow = ref$(this.$refs.menuArrow)
      // 跨窗口
      if (this.taskId !== this.dragData.taskId) {
        ref$(this.$refs.tabTask)
          .addClass('transition')
        // 重新设置窗口数据
        this.setInfo(this.dragData.event)
        this.dragData.isCross = this.dragData.rootTaskId !== this.taskId
      }
      // 储存当前拖动的任务id
      this.dragData.taskId = this.taskId
      // 在盒子区间内，因为超出无话获取，所以减去两个像素
      if (event.pageX >= this.dragData.barStartX && event.pageX <= this.dragData.barEndX - 2) {
        let isIn = false
        this.dragData.$dom.hide()

        for (let i = 0; i < this.dragData.interval.length; i++) {
          const item = this.dragData.interval[i]
          if (event.pageY > item.startY && event.pageY < item.endY) {
            isIn = true
            $tabTask.closest('[active="active"]')
              .css('margin-top', `${this.dragData.marginTop}px`)
              .removeAttr('active')

            ref$('[processid="' + item.pid + '"]', this.$refs.tabTask)
              .attr('active', 'active')
              .css('margin-top', this.dragData.activeHeight + 'px')
            this.dragData.replaceId = item.pid
            this.dragData.isLast = false
          }
        }

        if (!isIn) {
          if ($tabTask.closest('[active="active"]').length) {
            $tabTask.closest('[active="active"]')
              .css('margin-top', `${this.dragData.marginTop}px`)
              .removeAttr('active')
          }

          this.dragData.isLast = true
        }
      }
    },
    // tab盒子 - 离开目标区域
    handleTabWrapDragLeave (event) {
      if (this.dragData.ing !== true) {
        return
      }
      // 超出盒子范围内
      if (!(event.pageX >= this.dragData.barStartX && event.pageX <= this.dragData.barEndX - 2)) {
        this.reduction()
      }
    },
    // tab盒子 - 拖落在tab盒子区域
    handleTabWrapDrop (event, dropId) {
      if (this.dragData.ing !== true) {
        return
      }
      ref$(this.$refs.tabTask)
        .removeClass('transition')
      event.preventDefault()
      // 获取数组中目标位置
      const aimsIndex = this.pids.indexOf(this.dragData.replaceId)
      // 获取当前位置
      var currentIndex = this.pids.indexOf(this.dragData.id)
      var realIndex = 0
      // 有移动
      if (aimsIndex !== currentIndex || this.pids.length === 0) {
        // 获取实际显示数据
        if (this.dragData.isLast) {
          // 最后一个
          realIndex = this.pids.length - 1 <= -1 ? 0 : this.pids.length - 1
        } else {
          var pidsLists = []
          this.pids.forEach(pid => {
            if (pid !== this.dragData.id) {
              pidsLists.push(pid)
            }
          })
          // 实际替换位置
          realIndex = pidsLists.indexOf(this.dragData.replaceId)
        }

        var currentItem = ''
        // 是否跨窗口
        if (this.dragData.isCross) {
          removeArray(this.process[this.dragData.rootTaskId].pids, pid => pid === this.dragData.id)
          currentItem = this.dragData.id
        } else {
          currentItem = this.pids.splice(currentIndex, 1)[0]
        }
        this.pids.splice(realIndex, 0, currentItem)

        this.reduction()
        this.dragData.$dom.removeAttr('dmwDrag').fadeIn()
        this.$ddvMultiWindow.tabMoveMasterWindow({
          taskId: this.taskId,
          id: this.dragData.id
        })
        // 切换标签
        this.handleTask(event, 'click', this.dragData.id)
      } else {
        this.reduction()
        this.dragData.$dom.removeAttr('dmwDrag').fadeIn()
      }
    },
    pidsChange () {
      this.$nextTick(() => this.tabTaskLiInit())
    },
    tabTaskLiInit () {
      this.pids && Array.isArray(this.pids) && this.pids.forEach(pid => {
        var $dom = ref$('[processid="' + pid + '"]', this.$refs.tabTask)
        var dom = $dom[0]
        this.tabTaskLiLists[pid] = {
          dom,
          $: $dom,
          top: $dom.offset().top,
          left: $dom.offset().left,
          outerWidth: $dom.outerWidth(),
          outerHeight: $dom.outerHeight()
        }
      })
    }
  },
  watch: {
    pids: {
      deep: true,
      handler: 'pidsChange'
    }
  },
  destroyed () {}
}
</script>


