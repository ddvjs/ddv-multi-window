import { getError } from '../util/get-error'

export { EventMessageWindow, EventMessageWindow as default }

// 工具类
const util = require('ddv-auth/util')
// 获取一个错误对象的方法

Object.assign(EventMessageWindow.prototype, {
  // 事件头
  eventName: 'ddvTabSysEventMessage',
  // 可以接受的
  targetOrigin: '*'
}, {
  on: on,
  emit: emit,
  remove: remove,
  destroy: destroy,
  onCatch: onCatch,
  receive: receive,
  postEmit: postEmit,
  postEmitCall: postEmitCall,
  decodeMessage: decodeMessage,
  getMessageEvent: getMessageEvent,
  setGetContentWindow: setGetContentWindow
})
// 窗口消息
function EventMessageWindow (options) {
  if (this instanceof EventMessageWindow) {
    return constructor.call(this, options)
  } else {
    return new EventMessageWindow(options)
  }
}
// 构造函数
function constructor (options) {
  this.eventName = (options.eventName || 'ddvTabSysEventMessage')
  //
  this.postMessageType = options.postMessageType || (this.eventName + '#')
  this.targetOrigin = options.targetOrigin || '*'
  this.selfWindow = options.selfWindow || this.selfWindow
  // 回调进程池
  this.postEmitCallCbs = {}
  if (!this.selfWindow) {
    if (typeof window === 'object' && window === window.window) {
      this.selfWindow = window
    } else {
      throw getError('options.selfWindow must input', 'OPTIONS_SELFWINDOW_MUST_INPUT')
    }
  }
  this.selfWindow = options.selfWindow || ((typeof window === 'object' && window === window.window) ? window : this.selfWindow)
  this.setGetContentWindow(options.getContentWindow)
  if (util.isFunction(options.onCatch)) {
    this.onCatch = options.onCatch
  }
  this.onReceives = {}
  windowEventListener.call(this, this.selfWindow)
  postEmitCallCbListener.call(this)
}
function setGetContentWindow (fn) {
  if (util.isFunction(fn)) {
    this.getContentWindow = fn
  } else {
    this.getContentWindow = function () {
      return Promise.resolve({ contentWindow: window })
    }
  }
}
function postEmitCallCbListener () {
  this.on('postEmitCallCb', function (event) {
    var id = event.data.id
    var res = event.data.res
    var error = event.data.error
    var stack
    if (error && (error.message || error.stack)) {
      if (error.stack) {
        stack = '@postEmitCallCb ------postEmitCallCb------\n' + error.stack
      }
      postEmitCallCb.call(this, id, void 0, getError(error.message, error.name, error.errorId, stack))
    } else {
      postEmitCallCb.call(this, id, res)
    }
  }.bind(this))
}
function postEmitCallCb (id, res, e) {
  if (this.postEmitCallCbs[id]) {
    if (e) {
      this.postEmitCallCbs[id][1](e)
    } else {
      this.postEmitCallCbs[id][0](res)
    }
    delete this.postEmitCallCbs[id]
  } else {
    console.debug('不存在')
  }
}
// 发送信息
function postEmitCall (type, data, win, transfer) {
  return new Promise(function (resolve, reject) {
    var id = util.createNewPid()
    this.postEmitCallCbs[id] = [resolve, reject]
    this.postEmit(type, data, win, transfer, id, true)
      .then(function () {
        id = resolve = reject = void 0
      }, function (e) {
        postEmitCallCb.call(this, id, void 0, e)
        id = resolve = reject = e = void 0
      }.bind(this))
  }.bind(this))
}
// 发送信息
function postEmit (type, data, win, transfer, id, isCb) {
  var res, args, isPM, postMessage, contentWindow, targetOrigin
  if (typeof win === 'object') {
    res = win
  } else {
    args = util.argsToArray(arguments)
    type = data = res = transfer = id = isCb = void 0
    // 获取 window 对象
    return this.getContentWindow(win)
      .then(function (res) {
        args[2] = res
        res = args
        args = void 0
        return postEmit.apply(this, res)
      }.bind(this))
  }
  id = id || util.createNewPid()
  // 序列化
  var message = JSON.stringify({
    id: id,
    type: type,
    data: data,
    isCb: isCb || false
  })
  try {
    // 试图获取 postMessage
    postMessage = res.postMessage || void 0
    // 试图获取 targetOrigin
    targetOrigin = res.targetOrigin || void 0
    // 试图获取 contentWindow
    contentWindow = res.contentWindow || res
    // 如果获取 contentWindow 成功，
    // 并且contentWindow中有postMessage
    // 并且res要求使用isPostMessage时
    if (contentWindow && typeof contentWindow.postMessage === 'function' && res.isPostMessage) {
      // 强制使用 postMessage
      postMessage = contentWindow.postMessage.bind(contentWindow)
    }
    // 是否试图获取成功 postMessage
    isPM = typeof postMessage === 'function'
  } catch (e) {
    contentWindow = res
  }
  if (!targetOrigin) {
    targetOrigin = this.targetOrigin || '*'
  }

  if (isPM) {
    try {
      // isPostMessage为需要发送，如果存在postMessage方法，就使用postMessage发送事件
      postMessage(this.postMessageType + message, targetOrigin, transfer)
      return Promise.resolve(id)
    } catch (e) {
    }
  }
  // 试图使用调用模式传递
  if (postMessageCall.call(this, contentWindow, message)) {
    return Promise.resolve(id)
  }
  // 试图使用事件模式广播
  if (postMessageEvent.call(this, contentWindow, message)) {
    return Promise.resolve(id)
  }

  try {
    // 如果contentWindow存在postMessage方法，并且不是postMessage发送事件
    if (contentWindow && contentWindow.postMessage && contentWindow.postMessage !== postMessage) {
      // 尝试使用contentWindow.postMessage发送
      contentWindow.postMessage(this.postMessageType + message, targetOrigin, transfer)
      return Promise.resolve(id)
    }
  } catch (e) {
    return Promise.reject(e)
  }
  return Promise.reject(getError('postMessage fail', 'POST_MESSAGE_FAIL'))
}
// 试图使用调用模式传递
function postMessageCall (contentWindow, message) {
  var event
  try {
    // 如果contentWindow.onDdvMultiWindowEMCall存在this.eventName方法
    if (typeof contentWindow.onDdvMultiWindowEMCall === 'object' && typeof contentWindow.onDdvMultiWindowEMCall[this.eventName] === 'function') {
      event = this.getMessageEvent(this.eventName, { data: message })
      // 尝试使用contentWindow.onDdvMultiWindowEMCall的this.eventName发送
      return contentWindow.onDdvMultiWindowEMCall[this.eventName](event) && true
    }
  } catch (e) {
  }
}
// 试图使用事件模式广播
function postMessageEvent (contentWindow, message) {
  var event
  try {
    event = this.getMessageEvent(this.eventName, { data: message })
    try {
      // isPostMessage为需要发送，如果存在dispatchEvent方法，就使用dispatchEvent发送事件
      if (typeof contentWindow.dispatchEvent === 'function') {
        contentWindow.dispatchEvent(event)
        // 标记发送完毕，不需要再次发送
        return true
      }
    } catch (e) {
    }
    try {
      // isPostMessage为需要发送，如果存在fireEvent方法，就使用fireEvent发送事件
      if (typeof contentWindow.fireEvent === 'function') {
        contentWindow.fireEvent('on' + this.eventName, event)
        // 标记发送完毕，不需要再次发送
        return true
      }
    } catch (e) {
    }
  } catch (e) {
  }
  return false
}
// 移除监听
function remove (type, fn) {
  if (typeof type === 'function') {
    fn = type
    for (var key in this.onReceives) {
      if (this.onReceives.hasOwnProperty(key)) {
        this.remove(key, fn)
      }
    }
  } else if (typeof type === 'string') {
    if (typeof fn === 'function') {
      for (var i = 0; i < this.onReceives[type].length; i++) {
        // 如果是数组，并且是这个方法
        if (Array.isArray(this.onReceives[type]) && this.onReceives[type][i] === fn) {
          // 切除
          this.onReceives[type].splice(i, 1)
          // i 往后退1
          i--
        }
      }
    } else {
      delete this.onReceives[type]
    }
  }
}
// 触发
function emit (event) {
  var e
  if (!event.type) {
    e = getError('Message type error', 'MESSAGE_TYPE_ERROR')
    e.isDecodeError = true
    return Promise.reject(e)
  }
  var events = this.onReceives[event.type] || []
  for (var i = 0; i < events.length; i++) {
    emitFn.call({
      isCb: false,
      event: event,
      postEmit: postEmit.bind(this)
    }, events[i])
  }
  event = void 0
}
// 触发
function emitFn (fn) {
  return (new Promise(function (resolve, reject) {
    var res = fn(this.event)
    if (util.isFunction(res.then)) {
      this.isCb = true
      res.then(resolve, reject)
    } else if (res) {
      this.isCb = true
      resolve(res)
    } else {
      resolve()
    }
    resolve = reject = void 0
  }.bind(this)))
    .then(function (res) {
      return this.isCb && this.event && this.event.id && this.postEmit('postEmitCallCb', {
        id: this.event.id,
        res: res
      }, {
        contentWindow: this.event.source
      })
    }.bind(this), function (e) {
      return this.isCb && this.event && this.event.id && this.postEmit('postEmitCallCb', {
        id: this.event.id,
        error: {
          name: e.name || void 0,
          stack: e.stack || void 0,
          message: e.message || void 0,
          errorId: e.errorId || void 0
        }
      }, {
        contentWindow: this.event.source
      })
    }.bind(this))
}
// 监听
function on (type, fn) {
  if (!Array.isArray(this.onReceives[type])) {
    this.onReceives[type] = []
  }
  this.onReceives[type].push(fn)
}
// 解密数据
function decodeMessage (input) {
  var data
  if (typeof input !== 'string') {
    // 必须是字符串
    return Promise.reject(getError('Input must be a string', 'INPUT_MUST_STRING'))
  }
  try {
    data = JSON.parse(input)
  } catch (e) {
    return Promise.reject(getError('window not found', 'WINDOW_NOT_FINT'))
  }
  // 直接返回承诺
  return Promise.resolve(data)
}
// 获取一个标准的消息事件
function getMessageEvent (type, eventInit) {
  var event
  eventInit = typeof eventInit === 'object' ? eventInit : Object.create(null)
  eventInit.source = eventInit.source || this.selfWindow
  eventInit.origin = eventInit.origin || this.selfWindow.origin || (this.selfWindow.location && this.selfWindow.location.origin)

  try {
    if (typeof MessageEvent === 'function') {
      event = new MessageEvent(type, eventInit)
    } else {
      event = new Event(type, eventInit)
    }
  } catch (e) {
    event = eventInit
  }
  'source origin ports data id isCb'.split(' ').forEach(function (key) {
    try {
      if (eventInit[key] && event[key] !== eventInit[key]) {
        event[key] = eventInit[key]
      }
    } catch (e) {

    }
  })
  return event
}

function receiveMessage (event) {
  var input = event.data || void 0
  if (typeof input !== 'string' || input.substr(0, this.postMessageType.length) !== this.postMessageType) {
    // 必须是字符串，并且满足基本需求
    return void 0
  }
  // 解析数据
  return this.receive(event, input.substr(this.postMessageType.length))
}
function receiveCall (event) {
  try {
    this.receive(event)
  } catch (e) {
    return false
  }
  return true
}
function receiveEvent (event) {
  return this.receive(event)
}
function receive (event, data) {
  // 解析数据
  return this.decodeMessage(data || event.data || void 0)
    .then(function (data) {
      var e = this.getMessageEvent(data.type, Object.assign(Object.create(null), {
        source: event.source,
        origin: event.origin
      }, data))
      return this.emit(e)
    }.bind(this), function (e) {
      e.isDecodeError = true
      return this.onCatch(e)
    }.bind(this))
}
// 监听绑定
function windowEventListener (contentWindow) {
  if (contentWindow.addEventListener) { // all browsers except IE before version 9
    contentWindow.addEventListener('message', receiveMessage.bind(this), false)
    contentWindow.addEventListener(this.eventName, receiveEvent.bind(this), false)
  } else if (contentWindow.attachEvent) { // IE before version 9
    contentWindow.attachEvent('onmessage', receiveMessage.bind(this))
    contentWindow.attachEvent('on' + this.eventName, receiveEvent.bind(this))
  }
  try {
    if (typeof contentWindow.onDdvMultiWindowEMCall !== 'object') {
      contentWindow.onDdvMultiWindowEMCall = Object.create(null)
    }
    contentWindow.onDdvMultiWindowEMCall[this.eventName] = receiveCall.bind(this)
  } catch (e) {
  }
  return Promise.resolve()
}
// 默认异常处理
function onCatch (e) {
  return Promise.reject(e)
}
function destroy () {

}
