<template>
  <section>
    <!-- tab栏 -->
    <div class="tabTask-menu">
      <ul
        class="tabTask-menu__ul clearfix"
        ref="tabTaskWrap"
        @dragover.stop="($event) => handleTabWrapDragOver($event, null)"
        @dragleave.stop="($event) => handleTabWrapDragLeave($event)"
        @drop.stop="($event) => handleTabWrapDrop($event, null)"
        >
        <li
          ref="tabTask"
          :class="{
            'tabTask-menu__li': 1,
            'tabTask-menu__linow': id === activeId
          }"
          :key="id"
          :processid="id"
          v-if="id && process[id]"
          v-for="id in this.pids"
          draggable="true"
          @click="($event) => handleTask($event, 'click', id)"
          @contextmenu="($event) => handleTask($event, 'contextMenu', id)"
          @drop.stop="($event) => handleTabWrapDrop($event, id)"
          @dragstart.stop="($event) => handleTabDragStart($event, id)"
          @dragover.stop="($event) => handleTabWrapDragOver($event, id)"
          @dragend.stop="($event) => handleTabDragEnd($event, id)"
        >
          <div class="tabTask-menu__item">{{process[id].title}}</div>
          <div v-if="process[id].closable!==false" class="tabTask-menu__close" @click="handleTask($event, 'remove', id)">
            <i class="el-icon-close"></i>
          </div>
          <div v-if="process[id].refreshable!==false" class="fr tabTask-menu__refresh" @click="handleTask($event, 'refresh', id)">
            <i class="el-icon-refresh"></i>
          </div>
          <div class="fr tabTask-menu__refresh" @click.stop="handleTask($event, 'openMasterWindow', id)">
            <i class="el-icon-plus"></i>
          </div>
        </li>
        <li class="tabTask-menu__arrow" ref="menuArrow">
          <el-dropdown>
            <span class="el-dropdown-link">
              <i class="el-icon-arrow-down tabTask-menu__pull"></i>
            </span>
            <el-dropdown-menu slot="dropdown" style="margin-top: -3px;">
              <el-dropdown-item>
                <div class="tabTask-menu__dropItem">
                  <i class="fl iconfont icon-guanbiquanbu"></i>
                  <div class="tabTask-menu__txt" @click="handleTask($event, 'removeAll', task.id)">关闭全部</div> 
                </div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div class="tabTask-menu__dropItem">
                  <div class="tabTask-menu__manage">管理默认标签</div>
                </div>
              </el-dropdown-item>
              <el-dropdown-item
                :divided="index === 0"
                :key="id"
                v-for="(id, index) in this.pids">
                <div class="tabTask-menu__dropItem">
                  <div class="tabTask-menu__txt" @click="handleTask($event, 'click', id)">
                    {{process[id].title}}
                    <i class="el-icon-circle-close-outline f16" v-if="process[id].closable!==false" @click="handleTask($event, 'remove', id)"></i>
                    <i class="el-icon-refresh f16" v-if="process[id].refreshable!==false" @click="handleTask($event, 'refresh', id)"></i>
                  </div>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </li>
      </ul>
    </div>
  </section>
</template>
<script>
import ref$ from '../../../src/util/ref-to-jquery'

function removeArray (array, fn) {
  var res = []
  array.forEach(function (item, index) {
    if (fn(item)) {
      res.push.apply(res, array.splice(index, 1))
    }
  })
  return res
}

export default {
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
    }
  },
  data () {
    return {
      tabTaskLiLists: {},
      isLeave: false
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
          // obj.startX = 0
          // obj.endX = 0
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
      const $tabTask = ref$(this.$refs.tabTask)
      this.dragData.$dom = $tabTask.closest(event.target)
      ref$(this.$refs.tabTask)
        .addClass('transition')
      this.setInfo(event)
      this.dragData.id = pid
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
      event.dataTransfer.setData('text/plain', 'http://www.baidu.com/sfa/ss')
    },
    // tab标签 - 拖动结束
    handleTabDragEnd (event, pid) {
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
      // 超出盒子范围内
      if (!(event.pageY >= this.dragData.barStartY && event.pageY <= this.dragData.barEndY - 2)) {
        this.reduction()
      }
    },
    // tab盒子 - 拖落在tab盒子区域
    handleTabWrapDrop (event, dropId) {
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
  destroyed () {},
  mounted () {
    // 必须 是 mounted 后执行，非 ddvReadyd 事件
  }
}
</script>

<style scoped>
.el-submenu__title:hover {
  background-color: #fff;
}
.el-submenu .el-menu-item {
  min-width: 0;
  background-color: #fff;
  height: 40px;
  line-height: 40px;
  font-size: 13px;
}
.el-menu-item:focus,
.el-menu-item:hover {
  background: #e5f1fa;
}
.tabTask-menu__title1 > .el-submenu__title > .el-icon-arrow-down {
  opacity: 0;
}
.el-submenu.is-opened > .el-submenu__title .tabTask-menu__icon {
  transform: rotate(0);
}
.el-menu {
  border-right: none;
}
.el-submenu > .el-submenu__title .el-submenu__icon-arrow {
  display: none;
}
.is-opened.tabTask-menu__title2 .tabTask-menu__down {
  transform: rotate(90deg);
}
.tabTask-menu__title1 > .el-submenu__title {
  border-bottom: 1px solid #e0e1e6;
  border-top: 1px solid #e0e1e6;
  height: 50px;
  line-height: 50px;
}
.tabTask-menu__title2 > .el-submenu__title {
  height: 40px;
  line-height: 40px;
}
.el-submenu__title {
  padding-left: 20px !important;
}
.el-menu-item {
  padding-left: 52px !important;
}
.el-menu-item.is-active {
  background: #3a8cee;
  color: #fff;
}
.el-dropdown-menu__item:focus,
.el-dropdown-menu__item:not(.is-disabled):hover {
  background-color: #ecf5ff;
  color: #606266;
}
.el-submenu.is-active .el-submenu__title {
  border-bottom-color: #e0e1e6;
}
</style>

<style scoped>
.tabTask-menu {
  background: #3177cb;
  font-size: 13px;
  color: #000;
}
.tabTask-menu__li {
  float: left;
  background: #e0e1e5;
  width: auto;
  height: 32px;
  line-height: 32px;
  padding: 0 10px;
  margin-left: 5px;
  font-family: 'PingFangSC-Medium';
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  max-width: 150px;
  min-width: 120px;
  margin-top: 1px;
  cursor: default;
}
.transition {
  transition: all 0.2s;
}
.tabTask-menu__item {
  float: left;
  overflow: hidden;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 30px;
}
.tabTask-menu__ul {
  padding: 6px 0 0 20px;
  width: 100%;
  display: -webkit-box;
  display: -moz-flex;
  display: -ms-flexbox;
  display: flex;
  height: 40px;
  border: 1px solid rgba(0, 0, 0, 0);
  /* overflow-x: auto; */
}
.tabTask-menu__linow {
  background: #fff;
  border-bottom: 1px solid #fff;
}
.tabTask-menu__breadcrumb {
  height: 35px;
  padding-top: 12px;
  padding-left: 20px;
  border-bottom: 1px solid #dadee4;
  border-top: 1px solid #dadee4;
  background: #fff;
  font-size: 13px;
}
.tabTask-menu__arrow {
  float: left;
  background: #ebebeb;
  width: 32px;
  height: 32px;
  line-height: 32px;
  padding: 0 10px;
  margin-left: 5px;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  max-width: 32px;
  margin-top: 1px;
  text-align: center;
  border-top-right-radius: 5px;
  /* transition: all 0.3s; */
}
.tabTask-menu__pull {
  margin-left: -2px;
}
.tabTask-menu__dropItem {
  width: 115px;
  height: 26px;
  line-height: 26px;
  font-size: 13px;
  padding: 0 5px;
}
.tabTask-menu__txt {
  margin-left: 20px;
}
.tabTask-menu__manage {
  margin-left: 20px;
  color: #d81e06;
}
.tabTask-menu__time {
  font-size: 14px;
  float: right;
}
.tabTask-menu__close {
  display: block;
  color: #000;
  float: right;
  cursor: pointer;
  width: 15px;
  height: 15px;
  line-height: 16px;
  text-align: center;
  margin-top: 8px;
  margin-left: 3px;
}
.tabTask-menu__close :hover {
  background: #d81e06;
  color: #fff;
  border-radius: 50%;
}
.tabTask-menu__refresh {
  /* width: 13px;
      height: 13px; */
  font-size: 13px;
  cursor: pointer;
  float: right;
}
.tabTask-menu__title1 {
  background-color: #fff;
  color: #42494f;
  cursor: pointer;
  font-family: 'PingFangSC-Medium';
  margin-bottom: -1px;
}
.tabTask-menu__title2 {
  background-color: #fff;
  color: #42494f;
  font-family: 'PingFangSC-Regular';
}
.tabTask-menu__icon {
  font-size: 26px;
  -webkit-transition: all 0.3s;
  -o-transition: all 0.3s;
  transition: all 0.3s;
  -webkit-transform: rotate(-90deg);
  -ms-transform: rotate(-90deg);
  transform: rotate(-90deg);
  display: inline-block;
  position: absolute;
  top: 15%;
  right: 12px;
  margin-top: -7px;
  color: #333333;
}
.tabTask-menu__down {
  display: inline-block;
  margin: 0 5px;
  margin-top: -5px;
  -webkit-transition: all 0.3s;
  -o-transition: all 0.3s;
  transition: all 0.3s;
}
.tabTask-menu__iconf {
  display: inline-block;
  vertical-align: middle;
  margin-right: 5px;
  width: 24px;
  text-align: center;
  font-size: 18px;
}
.fl {
  float: left;
}
.fr {
  float: right;
}
</style>
