import LoadComponent from '../../components/load'
import TaskComponent from '../../components/task'
import cloneRenderOptions from '../../util/clone-render-options'
const ErrorComponent = LoadComponent
export default function render (h) {
  if (!this.ready) {
    return
  }
  const children = this.$slots.default ? Array.prototype.concat(this.$slots.default) : []

  // 守护进程 - 仅仅提供一个dom的根点
  children.push(h('div', cloneRenderOptions(this.renderOptions.daemon, {
    key: 'daemon_wrap',
    directives: [{
      name: 'show',
      rawName: 'show',
      value: false
    }]
  }), [
    // 主窗口 - 侧重显示 - 窗口切换 - 跨屏切换
    mains.call(this, h),
    // 窗口视图 - 侧重渲染 - 组件渲染
    views.call(this, h),
    // 任务栏
    tasks.call(this, h)
  ]))
  // 进程div - 核心进程
  return h('div', cloneRenderOptions(this.renderOptions.root, {
    key: 'root',
    attrs: {
      id: 'dmw_daemon_' + this.daemonId,
      'ddv-multi-window-type': 'root'
    }
  }), children)
}

function views (h) {
  // 所有视图的集合
  return h('div', cloneRenderOptions(this.renderOptions.views, {
    key: 'views',
    attrs: {
      'ddv-multi-window-type': 'views'
    }
  }), viewChildren.call(this, h))
}

function mains (h) {
  // 所有主窗口的集合
  return h('div', cloneRenderOptions(this.renderOptions.mains, {
    key: 'mains',
    attrs: {
      'ddv-multi-window-type': 'mains'
    }
  }), mainChildren.call(this, h))
}

function tasks (h) {
  // 所有任务栏的集合
  return h('div', cloneRenderOptions(this.renderOptions.tasks, {
    key: 'tasks',
    attrs: {
      'ddv-multi-window-type': 'tasks'
    }
  }), taskChildren.call(this, h))
}
function taskChildren (h) {
  // 所有任务栏的任务集合
  return this.taskIds.map(pid => {
    const process = this.process[pid]
    // 判断该进程id是否是 一个有视图的进程
    if (!process || !process.isTask) {
      // 既然没有视图，不需要渲染
      return
    }

    // 把视图插入视图集合
    return h('div', cloneRenderOptions(this.renderOptions.taskParent, {
      key: pid,
      ref: 'tp_' + pid,
      attrs: {
        'process-id': pid,
        'ddv-multi-window-type': 'taskParent'
      }
    }), [
      h('div', cloneRenderOptions(this.renderOptions.taskBox, {
        key: 'task',
        ref: 'tb_' + pid,
        attrs: {
          'process-id': pid,
          'ddv-multi-window-type': 'taskBox'
        }
      }), taskChildrenRender.call(this, h, process))
    ])
  })
}
function mainChildren (h) {
  // 窗口集合
  return this.taskIds.map(taskId => {
    const process = this.process[taskId]
    // 判断该进程id是否是 一个有视图的进程
    if (!process || !process.isTask) {
      // 既然没有视图，不需要渲染
      return
    }

    // 把视图插入视图集合
    return h('div', cloneRenderOptions(this.renderOptions.mainParent, {
      key: taskId,
      ref: 'mp_' + taskId,
      attrs: {
        'task-id': taskId,
        'ddv-multi-window-type': 'mainParent'
      }
    }), [
      h('div', cloneRenderOptions(this.renderOptions.mainBox, {
        key: 'main',
        ref: 'mb_' + taskId,
        attrs: {
          'task-id': taskId,
          'ddv-multi-window-type': 'mainBox'
        }
      }), (this.viewIds || []).map(pid => h('div', cloneRenderOptions(this.renderOptions.mainContent, {
        key: pid,
        ref: 'mc_' + taskId + '_p_' + pid,
        attrs: {
          'task-id': taskId,
          'process-id': pid,
          'ddv-multi-window-type': 'mainContent'
        },
        directives: [{
          name: 'show',
          rawName: 'show',
          value: process && pid === process.activeId
        }]
      }))))
    ])
  })
}
function taskChildrenRender (h, task) {
  const props = {
    task,
    process: this.process,
    handleTask: this.handleTask,
    taskOptions: this.taskOptions
  }
  const children = []
  if (this.$scopedSlots && this.$scopedSlots.task) {
    children.push(this.$scopedSlots.task(props))
  } else {
    children.push(h(TaskComponent, {
      key: 'task',
      attrs: {
        'ddv-multi-window-type': 'taskContent'
      },
      props
    }))
  }
  return children
}
function viewChildren (h) {
  return this.viewIds.map(pid => {
    const process = this.process[pid]
    // 判断该进程id是否是 一个有视图的进程
    if (!process || !process.isHasView) {
      // 既然没有视图，不需要渲染
      return
    }
    // 该窗口[视图]的子元素
    const children = []
    if (!process.init) {
      children.push(h(LoadComponent, cloneRenderOptions(this.renderOptions.viewLoad, {
        key: 'load',
        attrs: {
          'process-id': pid,
          'ddv-multi-window-type': 'loadBox'
        }
      })))
    } else if (process.error) {
      children.push(h(ErrorComponent, cloneRenderOptions(this.renderOptions.viewError, {
        key: 'error',
        attrs: {
          'process-id': pid,
          'ddv-multi-window-type': 'errorBox'
        },
        props: {
          error: this.error
        }
      })))
    } else if (process.mode === 'component') {
      if (process.component) {
        // 视图模式 为 vue 组件视图
        children.push(h(process.component, cloneRenderOptions(this.renderOptions.viewComponent, {
          props: {
          }
        })))
      } else {
        process.init = false
        this.loadComponent(pid)
          .then(() => {
            process.init = true
          })
          .catch(error => {
            process.error = error
          })
      }
      // 插入一个 iframe 的渲染
      // children.push(h('iframe', data))
    } else if (process.mode === 'iframe') {
      // 插入一个 iframe 的渲染
      children.push(h('iframe', cloneRenderOptions(this.renderOptions.viewIframe, {
        // 修改key
        key: 'iframe',
        // 修改ref
        ref: 'if_' + pid,
        on: {
          // 加载完成事件
          load: event => this.dmw$handleIframeLoad(event, pid)
        },
        attrs: {
          // 窗口的地址
          src: process.src,
          // 窗口的id
          'process-id': pid,
          // 类型
          'ddv-multi-window-type': 'iframe'
        }
      })))
    }
    // 把视图插入视图集合
    return h('div', cloneRenderOptions(this.renderOptions.viewParent, {
      key: pid,
      ref: 'vp_' + pid,
      attrs: {
        'process-id': pid,
        'ddv-multi-window-type': 'viewParent'
      }
    }), [
      h('div', cloneRenderOptions(this.renderOptions.viewBox, {
        key: 'view',
        ref: 'vb_' + pid,
        attrs: {
          'process-id': pid,
          'ddv-multi-window-type': 'viewBox'
        }
      }), children)
    ])
  })
}
