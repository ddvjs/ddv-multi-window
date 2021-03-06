import sleep from '../../util/sleep'
import { throwError } from '../../util/get-error'
import createNewPid from '../create-new-pid'
import { unDefDefault, unDefDefaultByObj } from '../../util/is-def'

export default {
  methods: {
    // 参数运行函数
    tryRun (fn) {
      return this._dmw$tryRun(fn)
        .catch(e => {
          if (this.errorHooks.length) {
            // 如果有错误监听就直接反馈
            return Promise.all(this.errorHooks.map(fn => fn && fn(e)))
          } else {
            // 否则传回上层
            return Promise.reject(e)
          }
        })
    },
    // 参数运行函数-正式
    _dmw$tryRun (fn) {
      if (typeof fn === 'function') {
        try {
          const res = fn()
          return (res && res.then) ? res : Promise.resolve(res)
        } catch (e) {
          return Promise.reject(e)
        }
      }
      return Promise.resolve()
    },
    createPid ({ mode }) {
      return (mode || 'child') + createNewPid()
    },
    // 是否存在窗口
    isHasId (pid) {
      return this.pids.indexOf(pid) > -1
    },
    checkPid (pid, tryNumMax, tryNum) {
      const isPromise = tryNumMax !== 0
      if (isPromise && tryNum > tryNumMax) {
        return throwError('Window does not exist', 'WINDOW_NOT_EXIST', isPromise)
      } else {
        tryNum = (tryNum || 0) + 1
      }
      if (!this.isHasId(pid)) {
        if (isPromise) {
          return sleep(150)
            .then(() => this.checkPid(pid, tryNumMax, tryNum))
        } else {
          return throwError('Window does not exist', 'WINDOW_NOT_EXIST', isPromise)
        }
      }
      return isPromise ? Promise.resolve() : void 0
    },
    // 获取windowId-通过iframe的window来获取所属的windowId
    getPidByWindow (cw, tryNumMax, tryNum) {
      const isPromise = tryNumMax !== 0
      tryNumMax = unDefDefault(tryNumMax, 50)
      if (isPromise && tryNum > tryNumMax) {
        return throwError('Find pid based on window', 'FIND_PID_FAIL_BY_CW', isPromise)
      } else {
        tryNum = (tryNum || 0) + 1
      }
      let pid, process, hasClosed
      for (pid in this.process) {
        process = this.process[pid]
        if (process.hasContentWindow) {
          if (!process.contentWindow || process.contentWindow.closed) {
            hasClosed = true
          } else if (process.contentWindow === cw) {
            return isPromise ? Promise.resolve(pid) : pid
          }
        }
      }
      if (isPromise && hasClosed) {
        if (isPromise) {
          return this.dmw$handleContentWindowLoad()
            .then(() => sleep(150))
            .then(() => this.getPidByWindow(cw, tryNumMax, tryNum))
        } else {
          return throwError('Process contentWindow not has init or closed', 'PROCESS_CW_NOT_INIT_OR_CLOSED', isPromise)
        }
      }
      return throwError('window not found', 'WINDOW_NOT_FINT', isPromise)
    },
    getWindowByPid (pid, tryNumMax, tryNum) {
      const isPromise = tryNumMax !== 0
      tryNumMax = unDefDefault(tryNumMax, 50)
      if (isPromise && tryNum > tryNumMax) {
        return throwError('Find window  based on pid', 'FIND_CW_FAIL_BY_PID', isPromise)
      } else {
        tryNum = (tryNum || 0) + 1
      }
      if (!pid) {
        return throwError('must input pid', 'MUST_INPUT_PID', isPromise)
      }
      const process = this.process[pid]
      if (process) {
        if (process.hasContentWindow) {
          if (!process.contentWindow || process.contentWindow.closed) {
            if (isPromise) {
              return this.dmw$handleContentWindowLoad()
                .then(() => sleep(150))
                .then(() => this.getWindowByPid(pid, tryNumMax, tryNum))
            } else {
              return throwError('Process contentWindow not has init or closed', 'PROCESS_CW_NOT_INIT_OR_CLOSED', isPromise)
            }
          } else {
            return isPromise ? Promise.resolve({ contentWindow: process.contentWindow }) : process.contentWindow
          }
        } else {
          return throwError('Process not has contentWindow', 'PROCESS_NOT_CW', isPromise)
        }
      } else {
        return throwError('Process data not found', 'PROCESS_NOT_FIND', isPromise)
      }
    },
    processPut (item) {
      // 获取到进程id
      item.id = item.id || item.pid
      const data = {
        // 类型
        mode: null,
        // 错误
        error: null,
        // 是否是任务栏
        isTask: false,
        // 是否有任务栏
        isHasTask: true,
        // 是否有视图
        isHasView: true,
        // 是否已经初始化
        init: false,
        // ref 初始化
        refinit: false
      }
      this.$set(this.process, item.id, unDefDefaultByObj(item, data))
    },
    // 路由准备完毕
    routerReady () {
      return new Promise((resolve, reject) => this.$router.onReady(resolve, reject))
    }
  }
}
