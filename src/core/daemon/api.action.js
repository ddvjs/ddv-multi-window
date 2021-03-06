
import { unDefDefaultByObj } from '../../util/is-def'
import removeArray from '../../util/remove-array'
import openDefaultData from '../../util/open-default-data'
import stringifyQuery from '../../util/stringify-query'
import isFunction from '../../util/is-function'

export default {
  methods: {
    open (input, parentDdvMultiWindow) {
      const opts = openDefaultData()
      // 构建配置选项
      var options = Object.create(null)
      // 如果传入参数是一个字符串
      if (typeof input === 'string') {
        // 路径
        options.src = input
        // 传入的
        options.options = {
          // 打开的窗口的路径
          src: input
        }
      } else if (typeof input === 'object') {
        // 进程中存在
        if (input.id && this.pids.indexOf(input.id) > -1 && this.process[input.id]) {
          // 直接定位到该标签
          return this.tabToWindow(input.id)
            .then(() => {
              if (input.refresh === true) {
                return this.refresh(input.id)
              }
            })
            .then(() => (this.process[input.id]))
        }
        // 支持path和query
        if (!input.src && input.path) {
          let src = input.path

          if (input.query) {
            src += stringifyQuery(input.query)
          }
          input.src = src
        }
        // 遍历属性
        Object.keys(opts).forEach(key => {
          if (Object.hasOwnProperty.call(input, key)) {
          // 复制属性
            options[key] = input[key]
          }
          options.options = input
        })
        // 还是没有src
        if (!options.src && parentDdvMultiWindow.$process) {
          const task = parentDdvMultiWindow.$process
          const route = task.route
          let src = route.path

          if (input.query) {
            src += stringifyQuery(input.query)
          } else {
            src += stringifyQuery(route.query)
          }
          options.src = src

          if (!input.title && task.title) {
            options.title = task.title
          }
        }
      }

      if (options.src) {
        // 找到对应的组件
        const matchedComponents = this.$router.getMatchedComponents(options.src)
        // 没有设置加载模式
        if (!options.mode) {
          // 设置加载模式
          options.mode = matchedComponents.length ? 'component' : 'iframe'
        }
        // 找到组件
        if (matchedComponents.length) {
          // 获取目标路由信息
          const { route, href } = this.$router.resolve(options.src)
          options.src = href
          options.route = route
        }
      } else if (typeof input === 'object') {
        // 还是没有src，暂时没办法
        // 获取目标路由信息
        const { route, href } = this.$router.resolve(input)
        options.src = href
        options.route = route
      }

      if (typeof input === 'object') {
        options.taskId = input.taskId || parentDdvMultiWindow && parentDdvMultiWindow.taskId
      } else {
        options.taskId = options.taskId || parentDdvMultiWindow && parentDdvMultiWindow.taskId
      }
      // 窗口类型
      options.mode = options.mode || 'iframe'
      // 创建窗口id
      if (!options.id) {
        options.id = this.createPid({
          mode: options.mode
        })
      }
      // 判断是否在任务栏上显示，如果找不到排除就是需要显示
      options.isHasTask = this.modeNotTasks.indexOf(options.mode) === -1
      // 是否有浏览器的全局窗口对象
      options.hasContentWindow = typeof options.hasContentWindow === 'undefined' ? ['iframe', 'daemon', 'master'].indexOf(options.mode) > -1 : options.hasContentWindow

      // 把值为undefined使用后面的对象的默认值
      unDefDefaultByObj(Object.assign(options, {
        // 守护进程id
        daemonId: this.daemonId
      }), opts)

      // 标题
      options.title = options.title || `新窗口[id:${options.id}]`
      // 判断一下 - 如果打开的窗口类型需要任务栏的，并且任务栏中找不到任务栏id
      if (options.isHasTask && !(this.process[options.taskId] && this.process[options.taskId].isTask)) {
        // 使用守护窗口任务栏
        options.taskId = 'daemon'
      }
      // 需要任务栏
      if (options.isHasTask) {
        // 是否有这个任务 - 没有这个任务，注册任务
        this.regTask(options.taskId)
        // 添加任务栏的任务
        this.addTask({
          taskId: options.taskId,
          id: options.id
        })
      }
      options.parentDdvMultiWindow = parentDdvMultiWindow || null
      // 修改窗口数据
      this.processPut(options)
      // 判断是否需要切换到这个tab标签
      return this.tabToWindow(options.id)
        .then(() => (this.process[options.id]))
    },
    remove (id) {
      const process = this.process[id]

      if (!this.isHasId(id)) {
        return Promise.reject(new Error('this window is not found'))
      }

      if (process.closable === false) {
        return Promise.reject(new Error('this window cannot be closed'))
      }
      process.removeing = true

      this.viewMoveParentByPid(id)
      this.taskIds.forEach(taskId => {
        const task = this.process[taskId]
        if (task) {
          // 移除任务栏
          removeArray(task.pids, item => item === id)
          // 移除任务栏历史
          removeArray(task.history, item => item === id)
        }
      })
      // 删除内容
      this.$delete(this.process, id)
      // 切换到任务栏的上一个
      return this.tabToLastWindowByTaskId(process.taskId || 'daemon')
    },
    refresh (id) {
      const process = this.process[id]

      if (!this.isHasId(id)) {
        return Promise.reject(new Error('this window is not found'))
      }

      if (process.refreshable === false) {
        return Promise.reject(new Error('this window does not support refresh'))
      }

      if (process.mode === 'component') {
        if (process.component) {
          if (Array.isArray(process.hook.beforeRefresh)) {
            for (let i = 0; i < process.hook.beforeRefresh.length; i++) {
              const fn = process.hook.beforeRefresh[i]

              if (isFunction(fn)) {
                const res = fn()

                if (res === false) {
                  return Promise.resolve()
                }
              }
            }
          }
          process.component = null
        }
      } else if (process.mode === 'iframe') {
        return this.getWindowByPid(id)
          .then(({ contentWindow }) => {
            contentWindow.location.reload(true)
          })
      } else {
        return Promise.reject(new Error('window does not support refresh'))
      }
    }
  }
}
