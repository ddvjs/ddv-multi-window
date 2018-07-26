export default Ready

function Ready (options) {
  if (this instanceof Ready) {
    return constructor.apply(this, arguments)
  } else {
    throw new Ready(options)
  }
}
Ready.prototype = {
  isReady,
  emitReady,
  waitReady,
  setIsReady,
  constructor,
  isReadyd: false,
  isReadyCb: void 0,
  initCheckTimeout: 3000,
  initCheckInterval: 100
}
function constructor (options) {
  // 状态检测进程池
  this.promises = []
  // 状态检测进程池
  this.isReadyCb = void 0
  // 状态检测进行中标记
  this.ing = false
}
function waitReady () {
  return new Promise(function (resolve, reject) {
    this.promises.push([resolve, reject])
    readyCheck.call(this)
  }.bind(this))
}
// 检测状态-运行
function readyCheck () {
  if (this.ing) {
    return
  }
  this.ing = true
  this.runStartTime = new Date()
  return isReadyCheck.call(this)
    .then(function (res) {
      var t
      while ((t = this.promises.splice(0, 1)) && (t = t && t[0]) && typeof t[0] === 'function') {
        t[0](res)
      }
      this.ing = false
    }.bind(this))
    .catch(function (e) {
      var t
      while ((t = this.promises.splice(0, 1)) && (t = t && t[0]) && typeof t[1] === 'function') {
        t[1](e)
      }
      this.ing = false
    }.bind(this))
}

// 设置检测状态的方法
function setIsReady (fn) {
  this.isReady = fn
}
function isReady () {
  if (this.isReadyd === true) {
    return Promise.resolve()
  }
  return new Promise(function (resolve, reject) {
    this.isReadyCb = [resolve, reject]
  }.bind(this))
}
function emitReady (e) {
  this.isReadyd = true
  if (!(this.isReadyCb && Array.isArray(this.isReadyCb) && this.isReadyCb[0])) {
    return
  }
  if (e && this.isReadyCb[1]) {
    this.isReadyCb[1](e)
  } else if (this.isReadyCb[0]) {
    this.isReadyCb[0]()
  }
}
// 检测状态-结果获取
function isReadyCheck () {
  if (this.isReady && typeof this.isReady === 'function') {
    return this.isReady()
  } else {
    return new Promise(function (resolve, reject) {
      if (new Date() - this.runStartTime > this.initCheckTimeout) {
        reject(new Error('wait Ready Timeout'))
      } else {
        setTimeout(resolve, this.initCheckInterval)
      }
    }.bind(this))
      .then(function () { return isReadyCheck.call(this) }.bind(this))
  }
}
