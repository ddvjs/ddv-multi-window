export default {
  props: {
    // 守护进程的id
    daemonId: {
      type: [Number, String],
      default: 'daemon'
    },
    // 以下类型的窗口没有所属任务栏
    modeNotTasks: {
      type: Array,
      default () {
        return [
          'daemon',
          'master'
        ]
      }
    },
    openMasterWindowSrc: {
      type: String,
      default: '/'
    },
    taskOptions: {
      type: Object,
      default () {
        return {}
      }
    },
    // process的默认配置项[options]
    renderOptions: {
      type: Object,
      default () {
        return {
          // 根
          root: {},
          // 守护 - 隐藏性dom
          daemon: {},
          // 视图集合 - 隐藏
          views: {},
          // 主窗口集合 - 隐藏
          mains: {},
          // 任务栏集合 - 隐藏
          tasks: {},
          // 每一个任务栏父层 - 显示
          taskParent: {},
          // 每一个任务栏盒子 - 显示
          taskBox: {},
          // 每一个主窗口父层 - 显示
          mainParent: {},
          // 每一个主窗口盒子 - 显示
          mainBox: {
            style: {
              width: '100%',
              height: '100%'
            }
          },
          // 每一个主窗口内容 - 显示
          mainContent: {
            style: {
              width: '100%',
              height: '100%'
            }
          },
          // 视图父层 - 隐藏
          viewParent: {},
          // 视图盒子 - 显示
          viewBox: {
            style: {
              width: '100%',
              height: '100%'
            }
          },
          // 视图加载 - 显示
          viewLoad: {},
          // 视图错误 - 显示
          viewError: {},
          // 视图组件 - 显示
          viewComponent: {},
          // 视图iframe - 显示
          viewIframe: {
            attrs: {
              frameborder: 0,
              width: '100%',
              height: '100%',
              allowtransparency: true
            }
          }
        }
      }
    }
  }
}
