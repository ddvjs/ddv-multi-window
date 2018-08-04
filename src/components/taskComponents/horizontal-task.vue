<template>
  <!-- tab栏 -->
  <div class="tabTask-menu tabTask">
    <ul
      :style="taskMenuStyle"
      class="tabTask-menu__ul clearfix"
      ref="tabTaskWrap"
      @dragover.stop="handleTabWrapDragOver($event, null)"
      @dragleave.stop="handleTabWrapDragLeave($event)"
      @drop.stop="handleTabWrapDrop($event, null)"
      >
      <li
        ref="tabTask"
        class="tabTask-menu__li"
        :class="{
          'tabTask-menu__linow': id === activeId
        }"
        :key="id"
        :processid="id"
        v-if="id && process[id]"
        v-for="id in this.pids"
        draggable="true"
        @click="handleTask($event, 'click', id)"
        @contextmenu="handleTask($event, 'contextMenu', id)"
        @drop.stop="handleTabWrapDrop($event, id)"
        @dragstart.stop="handleTabDragStart($event, id)"
        @dragover.stop="handleTabWrapDragOver($event, id)"
        @dragend.stop="handleTabDragEnd($event, id)"
      >
        <div class="tabTask-menu__item">{{process[id].title}}</div>
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
      <li
        class="tabTask-menu__arrow"
        ref="menuArrow"
        @mouseenter="isShowDropdown = true"
        @mouseleave="isShowDropdown = false">
        <i class="dmw-icon icon-down-arrow tabTask-menu__pull f14"></i>
        <transition name="fade">
          <ul class="menu-dropdown" v-show="isShowDropdown">
            <div class="menu-dropdown__arrow"></div>
            <li class="menu-dropdown__item">
              <div class="tabTask-menu__dropItem" @click="handleTask($event, 'removeAll', task.id)">
                <div class="text-center">关闭全部</div>
              </div>
            </li>
            <li class="menu-dropdown__item">
              <div class="tabTask-menu__dropItem">
                <div class="text-center tabTask-menu__manage">管理默认标签</div>
              </div>
            </li>
            <li class="menu-dropdown__item-line" v-if="pids && pids.length > 0"></li>
            <li
              class="menu-dropdown__item"
              v-for="id in pids"
              :key="id">
              <div class="tabTask-menu__dropItem clearfix"  @click="handleTask($event, 'click', id)">
                <div class="tabTask-menu__title">{{process[id].title}}</div>
                <div class="tabTask-menu__util">
                  <i
                    class="dmw-icon icon-close f12"
                    v-if="process[id].closable !== false"
                    @click="handleTask($event, 'remove', id)"></i>
                  <i
                    class="dmw-icon icon-refresh f12"
                    v-if="process[id].refreshable !== false"
                    @click="handleTask($event, 'refresh', id)"></i>
                </div>
              </div>
            </li>
          </ul>
        </transition>
      </li>
    </ul>
  </div>
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
        this.dragData.activeWidth = this.dragData.$dom.innerWidth() || this.dragData.activeWidth || 0
      } else {
        this.dragData.activeWidth = this.dragData.activeWidth || 0
      }
      this.dragData.marginLeft = 0
      this.dragData.$dom.attr('dmwDrag', '1')
      var placeholder = 0

      for (let i = 0; i < len; i++) {
        const $li = ref$('[processid="' + this.pids[i] + '"]', this.$refs.tabTask)
        const marginLeft = Number($li.css('margin-left').split('px')[0])
        const marginRight = Number($li.css('margin-right').split('px')[0])
        const position = $li.position()
        const isHide = $li.is('[dmwDrag="1"]')
        const obj = {}
        this.dragData.marginLeft += marginLeft
        // 实际显示位置
        if (isHide) {
          placeholder = $li.innerWidth() + marginLeft - marginRight
        } else {
          obj.startX = position.left + marginLeft - placeholder
          obj.endX = position.left + $li.innerWidth() + marginLeft - marginRight - placeholder
          obj.pid = this.pids[i]
          this.dragData.interval.push(obj)
        }
      }
      // 左边距的平均值
      this.dragData.marginLeft = Math.round(this.dragData.marginLeft / len)
      // bar
      this.dragData.barStartY = $tabTaskWrap.position().top
      this.dragData.barEndY = this.dragData.barStartY + $tabTaskWrap.outerHeight()
    },
    reduction () {
      ref$(this.$refs.menuArrow)
        .css('margin-left', `${this.dragData.marginLeft}px`)

      ref$('[active="active"]', this.$refs.tabTask)
        .css('margin-left', `${this.dragData.marginLeft}px`)
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
      this.dragData.$dom.removeAttr('dmwDrag').show()

      if (this.dragData.taskId === this.taskId && !(event.pageY >= this.dragData.barStartY && event.pageY <= this.dragData.barEndY - 2)) {
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
      const $menuArrow = ref$(this.$refs.menuArrow)
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
      if (event.pageY >= this.dragData.barStartY && event.pageY <= this.dragData.barEndY - 2) {
        let isIn = false
        this.dragData.$dom.hide()

        for (let i = 0; i < this.dragData.interval.length; i++) {
          const item = this.dragData.interval[i]

          if (event.pageX > item.startX && event.pageX < item.endX) {
            isIn = true
            $tabTask.closest('[active="active"]')
              .css('margin-left', `${this.dragData.marginLeft}px`)
              .removeAttr('active')

            ref$('[processid="' + item.pid + '"]', this.$refs.tabTask)
              .css('margin-left', this.dragData.activeWidth + 'px')
              .attr('active', 'active')
            $menuArrow.css('margin-left', `${this.dragData.marginLeft}px`)
            this.dragData.replaceId = item.pid
            this.dragData.isLast = false
          }
        }

        if (!isIn) {
          if ($tabTask.closest('[active="active"]').length) {
            $tabTask.closest('[active="active"]')
              .css('margin-left', `${this.dragData.marginLeft}px`)
              .removeAttr('active')
          }
          const lastItem = this.dragData.interval[this.dragData.interval.length - 1]

          if (lastItem && event.pageX > lastItem.endX) {
            if ($menuArrow.length) {
              $menuArrow.css('margin-left', this.dragData.activeWidth + 'px')
            }
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
      if (!(event.pageY >= this.dragData.barStartY && event.pageY <= this.dragData.barEndY - 2)) {
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
        this.dragData.$dom.removeAttr('dmwDrag').show()
        this.$ddvMultiWindow.tabMoveMasterWindow({
          taskId: this.taskId,
          id: this.dragData.id
        })
        // 切换标签
        this.handleTask(event, 'click', this.dragData.id)
      } else {
        this.reduction()
        this.dragData.$dom.removeAttr('dmwDrag').show()
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
