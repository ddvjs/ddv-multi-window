/*!
  * ddv-multi-window v3.0.1
  * (c) 2018 yuchonghua@163.com
  * @license MIT
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.DdvMultiWindow = {})));
}(this, (function (exports) { 'use strict';

function assert (condition, message) {
  if (!condition) {
    throw new Error(("[ddv-multi-window] " + message))
  }
}

function warn (condition, message) {
  if ("development" !== 'production' && !condition) {
    typeof console !== 'undefined' && console.warn(("[ddv-multi-window] " + message));
  }
}

/*  */

var inBrowser = typeof window !== 'undefined';

var vueAppMethods = [
  // 守护进程id
  'id',
  // 打开新窗口
  'open',
  // 移除窗口
  'remove',
  // 刷新窗口
  'refresh',
  // 试图运行
  'tryRun',
  // 进程
  'process',
  // 错误
  'onError',
  // 拖到数据
  'dragData',
  // 拖到数据
  'dragProcess',
  // 初始化
  'masterViewInit',
  // 切换窗口
  'tabToWindow',
  // 根据进程id获取窗口
  'getPidByWindow',
  // 根据窗口获取进程id
  'getWindowByPid',
  // 新窗口打开
  'openMasterWindow',
  // 移动到指定窗口
  'windowAppendChild',
  // 拖动到别的管理进程窗口
  'tabMoveMasterWindow',
  // 还原
  'closeMasterWindow',
  'masterMoveParentByTaskId'
];
var global;
function globalInit (g) {
  global = g;
}
function DdvMultiWindow (app, taskId) {
  this.constructor(app, taskId);
}
DdvMultiWindow.prototype = {
  constructor: constructor,
  open: open
};

vueAppMethods.forEach(function (method) {
  if (!DdvMultiWindow.prototype.hasOwnProperty(method)) {
    Object.defineProperty(DdvMultiWindow.prototype, method, {
      get: function get () {
        assert(this.app, '多窗口没有初始化');
        return this.app[method]
      },
      set: function set (value) {
        assert(this.app, '多窗口没有初始化');
        return (this.app[method] = value)
      }
    });
  }
});
function open (input) {
  if (typeof input === 'string') {
    input = { src: input };
  }
  input.taskId = this.taskId;
  return this.app.open(input)
}
function constructor (app, taskId) {
  // 非产品模式需要判断是否已经调用Vue.use(DdvMultiWindow)安装
  "development" !== 'production' && assert(
    global.installed,
    "not installed. Make sure to call `Vue.use(DdvMultiWindow)` " +
    "before creating root instance."
  );
  "development" !== 'production' && assert(
    inBrowser,
    "必须有一个window"
  );
  this.app = app;
  this.taskId = taskId;
}

function Ready (options) {
  if (this instanceof Ready) {
    return constructor$1.apply(this, arguments)
  } else {
    throw new Ready(options)
  }
}
Ready.prototype = {
  isReady: isReady,
  emitReady: emitReady,
  waitReady: waitReady,
  setIsReady: setIsReady,
  constructor: constructor$1,
  isReadyd: false,
  isReadyCb: void 0,
  initCheckTimeout: 3000,
  initCheckInterval: 100
};
function constructor$1 (options) {
  // 状态检测进程池
  this.promises = [];
  // 状态检测进程池
  this.isReadyCb = void 0;
  // 状态检测进行中标记
  this.ing = false;
}
function waitReady () {
  return new Promise(function (resolve, reject) {
    this.promises.push([resolve, reject]);
    readyCheck.call(this);
  }.bind(this))
}
// 检测状态-运行
function readyCheck () {
  if (this.ing) {
    return
  }
  this.ing = true;
  this.runStartTime = new Date();
  return isReadyCheck.call(this)
    .then(function (res) {
      var t;
      while ((t = this.promises.splice(0, 1)) && (t = t && t[0]) && typeof t[0] === 'function') {
        t[0](res);
      }
      this.ing = false;
    }.bind(this))
    .catch(function (e) {
      var t;
      while ((t = this.promises.splice(0, 1)) && (t = t && t[0]) && typeof t[1] === 'function') {
        t[1](e);
      }
      this.ing = false;
    }.bind(this))
}

// 设置检测状态的方法
function setIsReady (fn) {
  this.isReady = fn;
}
function isReady () {
  if (this.isReadyd === true) {
    return Promise.resolve()
  }
  return new Promise(function (resolve, reject) {
    this.isReadyCb = [resolve, reject];
  }.bind(this))
}
function emitReady (e) {
  this.isReadyd = true;
  if (!(this.isReadyCb && Array.isArray(this.isReadyCb) && this.isReadyCb[0])) {
    return
  }
  if (e && this.isReadyCb[1]) {
    this.isReadyCb[1](e);
  } else if (this.isReadyCb[0]) {
    this.isReadyCb[0]();
  }
}
// 检测状态-结果获取
function isReadyCheck () {
  if (this.isReady && typeof this.isReady === 'function') {
    return this.isReady()
  } else {
    return new Promise(function (resolve, reject) {
      if (new Date() - this.runStartTime > this.initCheckTimeout) {
        reject(new Error('wait Ready Timeout'));
      } else {
        setTimeout(resolve, this.initCheckInterval);
      }
    }.bind(this))
      .then(function () { return isReadyCheck.call(this) }.bind(this))
  }
}

function getError (message, name, errorId, stack) {
  if (this instanceof getError) {
    return getError(message, name, errorId)
  } else {
    var e = new Error(message || 'Unknown Error');
    e.name = name || errorId || e.name;
    e.errorId = errorId || e.name;
    if (stack) {
      e.stack = e.stack + '\n' + stack;
    }

    return e
  }
}
function throwError (message, name, isPromise, errorId, stack) {
  if (isPromise === false) {
    throw getError(message, name, errorId, stack)
  } else {
    return Promise.reject(getError(message, name, errorId, stack))
  }
}

// 工具类
var util = require('ddv-auth/util');
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
});
// 窗口消息
function EventMessageWindow (options) {
  if (this instanceof EventMessageWindow) {
    return constructor$2.call(this, options)
  } else {
    return new EventMessageWindow(options)
  }
}
// 构造函数
function constructor$2 (options) {
  this.eventName = (options.eventName || 'ddvTabSysEventMessage');
  //
  this.postMessageType = options.postMessageType || (this.eventName + '#');
  this.targetOrigin = options.targetOrigin || '*';
  this.selfWindow = options.selfWindow || this.selfWindow;
  // 回调进程池
  this.postEmitCallCbs = {};
  if (!this.selfWindow) {
    if (typeof window === 'object' && window === window.window) {
      this.selfWindow = window;
    } else {
      throw getError('options.selfWindow must input', 'OPTIONS_SELFWINDOW_MUST_INPUT')
    }
  }
  this.selfWindow = options.selfWindow || ((typeof window === 'object' && window === window.window) ? window : this.selfWindow);
  this.setGetContentWindow(options.getContentWindow);
  if (util.isFunction(options.onCatch)) {
    this.onCatch = options.onCatch;
  }
  this.onReceives = {};
  windowEventListener.call(this, this.selfWindow);
  postEmitCallCbListener.call(this);
}
function setGetContentWindow (fn) {
  if (util.isFunction(fn)) {
    this.getContentWindow = fn;
  } else {
    this.getContentWindow = function () {
      return Promise.resolve({ contentWindow: window })
    };
  }
}
function postEmitCallCbListener () {
  this.on('postEmitCallCb', function (event) {
    var id = event.data.id;
    var res = event.data.res;
    var error = event.data.error;
    var stack;
    if (error && (error.message || error.stack)) {
      if (error.stack) {
        stack = '@postEmitCallCb ------postEmitCallCb------\n' + error.stack;
      }
      postEmitCallCb.call(this, id, void 0, getError(error.message, error.name, error.errorId, stack));
    } else {
      postEmitCallCb.call(this, id, res);
    }
  }.bind(this));
}
function postEmitCallCb (id, res, e) {
  if (this.postEmitCallCbs[id]) {
    if (e) {
      this.postEmitCallCbs[id][1](e);
    } else {
      this.postEmitCallCbs[id][0](res);
    }
    delete this.postEmitCallCbs[id];
  } else {
    console.debug('不存在');
  }
}
// 发送信息
function postEmitCall (type, data, win, transfer) {
  return new Promise(function (resolve, reject) {
    var id = util.createNewPid();
    this.postEmitCallCbs[id] = [resolve, reject];
    this.postEmit(type, data, win, transfer, id, true)
      .then(function () {
        id = resolve = reject = void 0;
      }, function (e) {
        postEmitCallCb.call(this, id, void 0, e);
        id = resolve = reject = e = void 0;
      }.bind(this));
  }.bind(this))
}
// 发送信息
function postEmit (type, data, win, transfer, id, isCb) {
  var res, args, isPM, postMessage, contentWindow, targetOrigin;
  if (typeof win === 'object') {
    res = win;
  } else {
    args = util.argsToArray(arguments);
    type = data = res = transfer = id = isCb = void 0;
    // 获取 window 对象
    return this.getContentWindow(win)
      .then(function (res) {
        args[2] = res;
        res = args;
        args = void 0;
        return postEmit.apply(this, res)
      }.bind(this))
  }
  id = id || util.createNewPid();
  // 序列化
  var message = JSON.stringify({
    id: id,
    type: type,
    data: data,
    isCb: isCb || false
  });
  try {
    // 试图获取 postMessage
    postMessage = res.postMessage || void 0;
    // 试图获取 targetOrigin
    targetOrigin = res.targetOrigin || void 0;
    // 试图获取 contentWindow
    contentWindow = res.contentWindow || res;
    // 如果获取 contentWindow 成功，
    // 并且contentWindow中有postMessage
    // 并且res要求使用isPostMessage时
    if (contentWindow && typeof contentWindow.postMessage === 'function' && res.isPostMessage) {
      // 强制使用 postMessage
      postMessage = contentWindow.postMessage.bind(contentWindow);
    }
    // 是否试图获取成功 postMessage
    isPM = typeof postMessage === 'function';
  } catch (e) {
    contentWindow = res;
  }
  if (!targetOrigin) {
    targetOrigin = this.targetOrigin || '*';
  }

  if (isPM) {
    try {
      // isPostMessage为需要发送，如果存在postMessage方法，就使用postMessage发送事件
      postMessage(this.postMessageType + message, targetOrigin, transfer);
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
      contentWindow.postMessage(this.postMessageType + message, targetOrigin, transfer);
      return Promise.resolve(id)
    }
  } catch (e) {
    return Promise.reject(e)
  }
  return Promise.reject(getError('postMessage fail', 'POST_MESSAGE_FAIL'))
}
// 试图使用调用模式传递
function postMessageCall (contentWindow, message) {
  var event;
  try {
    // 如果contentWindow.onDdvMultiWindowEMCall存在this.eventName方法
    if (typeof contentWindow.onDdvMultiWindowEMCall === 'object' && typeof contentWindow.onDdvMultiWindowEMCall[this.eventName] === 'function') {
      event = this.getMessageEvent(this.eventName, { data: message });
      // 尝试使用contentWindow.onDdvMultiWindowEMCall的this.eventName发送
      return contentWindow.onDdvMultiWindowEMCall[this.eventName](event) && true
    }
  } catch (e) {
  }
}
// 试图使用事件模式广播
function postMessageEvent (contentWindow, message) {
  var event;
  try {
    event = this.getMessageEvent(this.eventName, { data: message });
    try {
      // isPostMessage为需要发送，如果存在dispatchEvent方法，就使用dispatchEvent发送事件
      if (typeof contentWindow.dispatchEvent === 'function') {
        contentWindow.dispatchEvent(event);
        // 标记发送完毕，不需要再次发送
        return true
      }
    } catch (e) {
    }
    try {
      // isPostMessage为需要发送，如果存在fireEvent方法，就使用fireEvent发送事件
      if (typeof contentWindow.fireEvent === 'function') {
        contentWindow.fireEvent('on' + this.eventName, event);
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
  var this$1 = this;

  if (typeof type === 'function') {
    fn = type;
    for (var key in this$1.onReceives) {
      if (this$1.onReceives.hasOwnProperty(key)) {
        this$1.remove(key, fn);
      }
    }
  } else if (typeof type === 'string') {
    if (typeof fn === 'function') {
      for (var i = 0; i < this.onReceives[type].length; i++) {
        // 如果是数组，并且是这个方法
        if (Array.isArray(this$1.onReceives[type]) && this$1.onReceives[type][i] === fn) {
          // 切除
          this$1.onReceives[type].splice(i, 1);
          // i 往后退1
          i--;
        }
      }
    } else {
      delete this.onReceives[type];
    }
  }
}
// 触发
function emit (event) {
  var this$1 = this;

  var e;
  if (!event.type) {
    e = getError('Message type error', 'MESSAGE_TYPE_ERROR');
    e.isDecodeError = true;
    return Promise.reject(e)
  }
  var events = this.onReceives[event.type] || [];
  for (var i = 0; i < events.length; i++) {
    emitFn.call({
      isCb: false,
      event: event,
      postEmit: postEmit.bind(this$1)
    }, events[i]);
  }
  event = void 0;
}
// 触发
function emitFn (fn) {
  return (new Promise(function (resolve, reject) {
    var res = fn(this.event);
    if (util.isFunction(res.then)) {
      this.isCb = true;
      res.then(resolve, reject);
    } else if (res) {
      this.isCb = true;
      resolve(res);
    } else {
      resolve();
    }
    resolve = reject = void 0;
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
    this.onReceives[type] = [];
  }
  this.onReceives[type].push(fn);
}
// 解密数据
function decodeMessage (input) {
  var data;
  if (typeof input !== 'string') {
    // 必须是字符串
    return Promise.reject(getError('Input must be a string', 'INPUT_MUST_STRING'))
  }
  try {
    data = JSON.parse(input);
  } catch (e) {
    return Promise.reject(getError('window not found', 'WINDOW_NOT_FINT'))
  }
  // 直接返回承诺
  return Promise.resolve(data)
}
// 获取一个标准的消息事件
function getMessageEvent (type, eventInit) {
  var event;
  eventInit = typeof eventInit === 'object' ? eventInit : Object.create(null);
  eventInit.source = eventInit.source || this.selfWindow;
  eventInit.origin = eventInit.origin || this.selfWindow.origin || (this.selfWindow.location && this.selfWindow.location.origin);

  try {
    if (typeof MessageEvent === 'function') {
      event = new MessageEvent(type, eventInit);
    } else {
      event = new Event(type, eventInit);
    }
  } catch (e) {
    event = eventInit;
  }
  'source origin ports data id isCb'.split(' ').forEach(function (key) {
    try {
      if (eventInit[key] && event[key] !== eventInit[key]) {
        event[key] = eventInit[key];
      }
    } catch (e) {

    }
  });
  return event
}

function receiveMessage (event) {
  var input = event.data || void 0;
  if (typeof input !== 'string' || input.substr(0, this.postMessageType.length) !== this.postMessageType) {
    // 必须是字符串，并且满足基本需求
    return void 0
  }
  // 解析数据
  return this.receive(event, input.substr(this.postMessageType.length))
}
function receiveCall (event) {
  try {
    this.receive(event);
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
      }, data));
      return this.emit(e)
    }.bind(this), function (e) {
      e.isDecodeError = true;
      return this.onCatch(e)
    }.bind(this))
}
// 监听绑定
function windowEventListener (contentWindow) {
  if (contentWindow.addEventListener) { // all browsers except IE before version 9
    contentWindow.addEventListener('message', receiveMessage.bind(this), false);
    contentWindow.addEventListener(this.eventName, receiveEvent.bind(this), false);
  } else if (contentWindow.attachEvent) { // IE before version 9
    contentWindow.attachEvent('onmessage', receiveMessage.bind(this));
    contentWindow.attachEvent('on' + this.eventName, receiveEvent.bind(this));
  }
  try {
    if (typeof contentWindow.onDdvMultiWindowEMCall !== 'object') {
      contentWindow.onDdvMultiWindowEMCall = Object.create(null);
    }
    contentWindow.onDdvMultiWindowEMCall[this.eventName] = receiveCall.bind(this);
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

function isDef (v) {
  return typeof v !== 'undefined'
}

function unDefDefault (v, d) {
  return isDef(v) ? v : d
}

function unDefDefaultByObj (v, d) {
  Object.keys(d).forEach(function (key) {
    v[key] = unDefDefault(v[key], d[key]);
  });
  return v
}

var $ = require('jquery');
function refToJquery (selector, refs) {
  if (!isDef(refs) && isDef(selector)) {
    refs = selector;
    selector = void 0;
  }
  var $refs = $(refs);
  return selector ? $refs.closest(selector) : $refs
}

// 切除数组中的一些数据
function removeArray (array, fn) {
  var res = [];
  array.forEach(function (item, index) {
    if (fn(item)) {
      res.push.apply(res, array.splice(index, 1));
    }
  });
  return res
}

//

var script = {
  name: 'ddv-multi-window-task-template',
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
    taskId: function taskId () {
      return this.task ? this.task.id : null
    },
    activeId: function activeId () {
      return this.task ? this.task.activeId : null
    },
    pids: function pids () {
      return this.task ? this.task.pids : []
    },
    dragData: function dragData () {
      return this.$ddvMultiWindow.dragData || {}
    }
  },
  data: function data () {
    return {
      tabTaskLiLists: {},
      isLeave: false,
      isShowDropdown: false
    }
  },
  methods: {
    setInfo: function setInfo (event) {
      var this$1 = this;

      var $tabTaskWrap = refToJquery(this.$refs.tabTaskWrap);
      var len = this.pids.length;

      this.dragData.event = event;
      this.dragData.interval = [];

      if (this.dragData.$dom && this.dragData.$dom.length) {
        this.dragData.activeWidth = this.dragData.$dom.innerWidth() || this.dragData.activeWidth || 0;
      } else {
        this.dragData.activeWidth = this.dragData.activeWidth || 0;
      }
      this.dragData.marginLeft = 0;
      this.dragData.$dom.attr('dmwDrag', '1');
      var placeholder = 0;

      for (var i = 0; i < len; i++) {
        var $li = refToJquery('[processid="' + this$1.pids[i] + '"]', this$1.$refs.tabTask);
        var marginLeft = Number($li.css('margin-left').split('px')[0]);
        var marginRight = Number($li.css('margin-right').split('px')[0]);
        var position = $li.position();
        var isHide = $li.is('[dmwDrag="1"]');
        var obj = {};
        this$1.dragData.marginLeft += marginLeft;
        // 实际显示位置
        if (isHide) {
          placeholder = $li.innerWidth() + marginLeft - marginRight;
          // obj.startX = 0
          // obj.endX = 0
        } else {
          obj.startX = position.left + marginLeft - placeholder;
          obj.endX = position.left + $li.innerWidth() + marginLeft - marginRight - placeholder;
          obj.pid = this$1.pids[i];
          this$1.dragData.interval.push(obj);
        }
      }
      // 左边距的平均值
      this.dragData.marginLeft = Math.round(this.dragData.marginLeft / len);
      // bar
      this.dragData.barStartY = $tabTaskWrap.position().top;
      this.dragData.barEndY = this.dragData.barStartY + $tabTaskWrap.outerHeight();
    },
    reduction: function reduction () {
      refToJquery(this.$refs.menuArrow)
        .css('margin-left', ((this.dragData.marginLeft) + "px"));

      refToJquery('[active="active"]', this.$refs.tabTask)
        .css('margin-left', ((this.dragData.marginLeft) + "px"))
        .removeAttr('active');
    },
    // tab标签 - 开始拖动源对象
    handleTabDragStart: function handleTabDragStart (event, pid) {
      var $tabTask = refToJquery(this.$refs.tabTask);
      this.dragData.$dom = $tabTask.closest(event.target);
      refToJquery(this.$refs.tabTask)
        .addClass('transition');
      this.setInfo(event);
      this.dragData.id = pid;
      this.dragData.taskId = this.taskId;
      // 原始taskId
      this.dragData.rootTaskId = this.taskId;
      // 是否有跨窗口
      this.dragData.isCross = false;

      event.ddvCmsTaskWindowId = pid;
      // 保存数据--该img元素的id
      event.dataTransfer.dropEffect = 'move';
      event.dataTransfer.effectAllowed = 'linkMove';
      event.dataTransfer.setData('ddvCmsDrag', JSON.stringify({
        'type': 'tabTask',
        'data': {
          windowId: pid
        }
      }));
      event.dataTransfer.setData('text/plain', 'http://www.baidu.com/sfa/ss');
    },
    // tab标签 - 拖动结束
    handleTabDragEnd: function handleTabDragEnd (event, pid) {
      var this$1 = this;

      refToJquery(this.$refs.tabTask)
        .removeClass('transition');
      this.activeEvent = null;
      this.dragData.id = null;
      this.reduction();
      this.dragData.$dom.removeAttr('dmwDrag').show();

      if (this.dragData.taskId === this.taskId && !(event.pageY >= this.dragData.barStartY && event.pageY <= this.dragData.barEndY - 2)) {
        return this.$ddvMultiWindow.tryRun(function () { return this$1.$ddvMultiWindow.openMasterWindow(pid)
            .catch(function (e) {
              if (e.name === 'OPEN_WINDOW_FAIL') {
                return this$1.$confirm('你是否要在新窗口打开', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                })
                  .then(function () { return this$1.$ddvMultiWindow.openMasterWindow(pid); }, function (e) {})
              } else {
                return Promise.reject(e)
              }
            }); }
        )
      }
    },
    // tab标签 - 在目标区域拖拽
    handleTabWrapDragOver: function handleTabWrapDragOver (event, dropId) {
      var this$1 = this;

      // 注意禁止浏览器默认事件
      event.preventDefault();
      var $tabTask = refToJquery(this.$refs.tabTask);
      var $menuArrow = refToJquery(this.$refs.menuArrow);
      // 跨窗口
      if (this.taskId !== this.dragData.taskId) {
        refToJquery(this.$refs.tabTask)
          .addClass('transition');
        // 重新设置窗口数据
        this.setInfo(this.dragData.event);
        this.dragData.isCross = this.dragData.rootTaskId !== this.taskId;
      }
      // 储存当前拖动的任务id
      this.dragData.taskId = this.taskId;

      // 在盒子区间内，因为超出无话获取，所以减去两个像素
      if (event.pageY >= this.dragData.barStartY && event.pageY <= this.dragData.barEndY - 2) {
        var isIn = false;
        this.dragData.$dom.hide();

        for (var i = 0; i < this.dragData.interval.length; i++) {
          var item = this$1.dragData.interval[i];

          if (event.pageX > item.startX && event.pageX < item.endX) {
            isIn = true;
            $tabTask.closest('[active="active"]')
              .css('margin-left', ((this$1.dragData.marginLeft) + "px"))
              .removeAttr('active');

            refToJquery('[processid="' + item.pid + '"]', this$1.$refs.tabTask)
              .css('margin-left', this$1.dragData.activeWidth + 'px')
              .attr('active', 'active');
            $menuArrow.css('margin-left', ((this$1.dragData.marginLeft) + "px"));
            this$1.dragData.replaceId = item.pid;
            this$1.dragData.isLast = false;
          }
        }

        if (!isIn) {
          if ($tabTask.closest('[active="active"]').length) {
            $tabTask.closest('[active="active"]')
              .css('margin-left', ((this.dragData.marginLeft) + "px"))
              .removeAttr('active');
          }
          var lastItem = this.dragData.interval[this.dragData.interval.length - 1];

          if (lastItem && event.pageX > lastItem.endX) {
            if ($menuArrow.length) {
              $menuArrow.css('margin-left', this.dragData.activeWidth + 'px');
            }
          }
          this.dragData.isLast = true;
        }
      }
    },
    // tab盒子 - 离开目标区域
    handleTabWrapDragLeave: function handleTabWrapDragLeave (event) {
      // 超出盒子范围内
      if (!(event.pageY >= this.dragData.barStartY && event.pageY <= this.dragData.barEndY - 2)) {
        this.reduction();
      }
    },
    // tab盒子 - 拖落在tab盒子区域
    handleTabWrapDrop: function handleTabWrapDrop (event, dropId) {
      var this$1 = this;

      refToJquery(this.$refs.tabTask)
        .removeClass('transition');
      event.preventDefault();
      // 获取数组中目标位置
      var aimsIndex = this.pids.indexOf(this.dragData.replaceId);
      // 获取当前位置
      var currentIndex = this.pids.indexOf(this.dragData.id);
      var realIndex = 0;
      // 有移动
      if (aimsIndex !== currentIndex || this.pids.length === 0) {
        // 获取实际显示数据
        if (this.dragData.isLast) {
          // 最后一个
          realIndex = this.pids.length - 1 <= -1 ? 0 : this.pids.length - 1;
        } else {
          var pidsLists = [];
          this.pids.forEach(function (pid) {
            if (pid !== this$1.dragData.id) {
              pidsLists.push(pid);
            }
          });
          // 实际替换位置
          realIndex = pidsLists.indexOf(this.dragData.replaceId);
        }

        var currentItem = '';
        // 是否跨窗口
        if (this.dragData.isCross) {
          removeArray(this.process[this.dragData.rootTaskId].pids, function (pid) { return pid === this$1.dragData.id; });
          currentItem = this.dragData.id;
        } else {
          currentItem = this.pids.splice(currentIndex, 1)[0];
        }
        this.pids.splice(realIndex, 0, currentItem);

        this.reduction();
        this.dragData.$dom.removeAttr('dmwDrag').show();
        this.$ddvMultiWindow.tabMoveMasterWindow({
          taskId: this.taskId,
          id: this.dragData.id
        });
        // 切换标签
        this.handleTask(event, 'click', this.dragData.id);
      } else {
        this.reduction();
        this.dragData.$dom.removeAttr('dmwDrag').show();
      }
    },
    pidsChange: function pidsChange () {
      var this$1 = this;

      this.$nextTick(function () { return this$1.tabTaskLiInit(); });
    },
    tabTaskLiInit: function tabTaskLiInit () {
      var this$1 = this;

      this.pids && Array.isArray(this.pids) && this.pids.forEach(function (pid) {
        var $dom = refToJquery('[processid="' + pid + '"]', this$1.$refs.tabTask);
        var dom = $dom[0];
        this$1.tabTaskLiLists[pid] = {
          dom: dom,
          $: $dom,
          top: $dom.offset().top,
          left: $dom.offset().left,
          outerWidth: $dom.outerWidth(),
          outerHeight: $dom.outerHeight()
        };
      });
    }
  },
  watch: {
    pids: {
      deep: true,
      handler: 'pidsChange'
    }
  },
  destroyed: function destroyed () {},
  mounted: function mounted () {
    // 必须 是 mounted 后执行，非 ddvReadyd 事件
  }
}

/* script */
            var __vue_script__ = script;
            
/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("section", [
    _c("div", { staticClass: "tabTask-menu" }, [
      _c(
        "ul",
        {
          ref: "tabTaskWrap",
          staticClass: "tabTask-menu__ul clearfix",
          on: {
            dragover: function($event) {
              $event.stopPropagation();
              return (function($event) {
                return _vm.handleTabWrapDragOver($event, null)
              })($event)
            },
            dragleave: function($event) {
              $event.stopPropagation();
              return (function($event) {
                return _vm.handleTabWrapDragLeave($event)
              })($event)
            },
            drop: function($event) {
              $event.stopPropagation();
              return (function($event) {
                return _vm.handleTabWrapDrop($event, null)
              })($event)
            }
          }
        },
        [
          _vm._l(this.pids, function(id) {
            return id && _vm.process[id]
              ? _c(
                  "li",
                  {
                    key: id,
                    ref: "tabTask",
                    refInFor: true,
                    class: {
                      "tabTask-menu__li": 1,
                      "tabTask-menu__linow": id === _vm.activeId
                    },
                    attrs: { processid: id, draggable: "true" },
                    on: {
                      click: function($event) {
                        return _vm.handleTask($event, "click", id)
                      },
                      contextmenu: function($event) {
                        return _vm.handleTask($event, "contextMenu", id)
                      },
                      drop: function($event) {
                        $event.stopPropagation();
                        return (function($event) {
                          return _vm.handleTabWrapDrop($event, id)
                        })($event)
                      },
                      dragstart: function($event) {
                        $event.stopPropagation();
                        return (function($event) {
                          return _vm.handleTabDragStart($event, id)
                        })($event)
                      },
                      dragover: function($event) {
                        $event.stopPropagation();
                        return (function($event) {
                          return _vm.handleTabWrapDragOver($event, id)
                        })($event)
                      },
                      dragend: function($event) {
                        $event.stopPropagation();
                        return (function($event) {
                          return _vm.handleTabDragEnd($event, id)
                        })($event)
                      }
                    }
                  },
                  [
                    _c("div", { staticClass: "tabTask-menu__item" }, [
                      _vm._v(_vm._s(_vm.process[id].title))
                    ]),
                    _vm._v(" "),
                    _vm.process[id].closable !== false
                      ? _c(
                          "div",
                          {
                            staticClass: "tabTask-menu__close",
                            on: {
                              click: function($event) {
                                _vm.handleTask($event, "remove", id);
                              }
                            }
                          },
                          [_c("i", { staticClass: "dmw-icon icon-close" })]
                        )
                      : _vm._e(),
                    _vm._v(" "),
                    _vm.process[id].refreshable !== false
                      ? _c(
                          "div",
                          {
                            staticClass: "fr tabTask-menu__refresh",
                            on: {
                              click: function($event) {
                                _vm.handleTask($event, "refresh", id);
                              }
                            }
                          },
                          [_c("i", { staticClass: "dmw-icon icon-refresh" })]
                        )
                      : _vm._e(),
                    _vm._v(" "),
                    _c(
                      "div",
                      {
                        staticClass: "fr tabTask-menu__refresh",
                        on: {
                          click: function($event) {
                            $event.stopPropagation();
                            _vm.handleTask($event, "openMasterWindow", id);
                          }
                        }
                      },
                      [_c("i", { staticClass: "dmw-icon icon-new-window" })]
                    )
                  ]
                )
              : _vm._e()
          }),
          _vm._v(" "),
          _c(
            "li",
            {
              ref: "menuArrow",
              staticClass: "tabTask-menu__arrow",
              on: {
                mouseenter: function($event) {
                  _vm.isShowDropdown = true;
                },
                mouseleave: function($event) {
                  _vm.isShowDropdown = false;
                }
              }
            },
            [
              _c("i", {
                staticClass: "dmw-icon icon-down-arrow tabTask-menu__pull"
              }),
              _vm._v(" "),
              _c("transition", { attrs: { name: "fade" } }, [
                _c(
                  "ul",
                  {
                    directives: [
                      {
                        name: "show",
                        rawName: "v-show",
                        value: _vm.isShowDropdown,
                        expression: "isShowDropdown"
                      }
                    ],
                    staticClass: "menu-dropdown"
                  },
                  [
                    _c("div", { staticClass: "menu-dropdown__arrow" }),
                    _vm._v(" "),
                    _c("li", { staticClass: "menu-dropdown__item" }, [
                      _c("div", { staticClass: "tabTask-menu__dropItem" }, [
                        _c("div", { staticClass: "text-center" }, [
                          _vm._v("关闭全部")
                        ])
                      ])
                    ]),
                    _vm._v(" "),
                    _c("li", { staticClass: "menu-dropdown__item" }, [
                      _c("div", { staticClass: "tabTask-menu__dropItem" }, [
                        _c(
                          "div",
                          { staticClass: "text-center tabTask-menu__manage" },
                          [_vm._v("管理默认标签")]
                        )
                      ])
                    ]),
                    _vm._v(" "),
                    _vm.pids && _vm.pids.length > 0
                      ? _c("li", { staticClass: "menu-dropdown__item-line" })
                      : _vm._e(),
                    _vm._v(" "),
                    _vm._l(_vm.pids, function(id) {
                      return _c(
                        "li",
                        { key: id, staticClass: "menu-dropdown__item" },
                        [
                          _c(
                            "div",
                            {
                              staticClass: "tabTask-menu__dropItem clearfix",
                              on: {
                                click: function($event) {
                                  _vm.handleTask($event, "click", id);
                                }
                              }
                            },
                            [
                              _c(
                                "div",
                                { staticClass: "tabTask-menu__title" },
                                [_vm._v(_vm._s(_vm.process[id].title))]
                              ),
                              _vm._v(" "),
                              _c("div", { staticClass: "tabTask-menu__util" }, [
                                _vm.process[id].closable !== false
                                  ? _c("i", {
                                      staticClass: "dmw-icon icon-close f12",
                                      on: {
                                        click: function($event) {
                                          _vm.handleTask($event, "remove", id);
                                        }
                                      }
                                    })
                                  : _vm._e(),
                                _vm._v(" "),
                                _vm.process[id].refreshable !== false
                                  ? _c("i", {
                                      staticClass: "dmw-icon icon-refresh f12",
                                      on: {
                                        click: function($event) {
                                          _vm.handleTask($event, "refresh", id);
                                        }
                                      }
                                    })
                                  : _vm._e()
                              ])
                            ]
                          )
                        ]
                      )
                    })
                  ],
                  2
                )
              ])
            ],
            1
          )
        ],
        2
      )
    ])
  ])
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-6419bf65_0", { source: "\n*[data-v-6419bf65] {\n  box-sizing: border-box;\n}\n.iconfont[data-v-6419bf65] {\n  display: inline-block;\n  speak: none;\n  font-style: normal;\n  font-weight: 400;\n  font-variant: normal;\n  text-transform: none;\n  line-height: 1;\n  vertical-align: baseline;\n  font-size: 14px;\n  margin: 0 2px;\n}\n.f12[data-v-6419bf65] {\n  font-size: 12px !important;\n}\n.clearfix[data-v-6419bf65] {\n  *zoom: 1\n}\n.clearfix[data-v-6419bf65]:after {\n  visibility: hidden;\n  clear: both;\n  display: block;\n  content: \".\";\n  height: 0;\n}\n.tabTask-menu[data-v-6419bf65] {\n  background: #3177cb;\n  font-size: 13px;\n  color: #000;\n}\n.tabTask-menu__li[data-v-6419bf65] {\n  float: left;\n  background: #e0e1e5;\n  width: auto;\n  height: 32px;\n  line-height: 32px;\n  padding: 0 10px;\n  margin-left: 5px;\n  font-family: 'PingFangSC-Medium';\n  -webkit-box-flex: 1;\n  -ms-flex: 1;\n  flex: 1;\n  max-width: 150px;\n  min-width: 120px;\n  margin-top: 1px;\n  cursor: default;\n}\n.transition[data-v-6419bf65] {\n  transition: all 0.3s;\n}\n.tabTask-menu__item[data-v-6419bf65] {\n  float: left;\n  overflow: hidden;\n  -o-text-overflow: ellipsis;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  min-width: 30px;\n  max-width: 86px;\n}\n.tabTask-menu__ul[data-v-6419bf65] {\n  padding: 6px 0 0 20px;\n  width: 100%;\n  display: -webkit-box;\n  display: -moz-flex;\n  display: -ms-flexbox;\n  display: flex;\n  height: 40px;\n  border: 1px solid rgba(0, 0, 0, 0);\n  /* overflow-x: auto; */\n}\n.tabTask-menu__linow[data-v-6419bf65] {\n  background: #fff;\n  border-bottom: 1px solid #fff;\n}\n.tabTask-menu__breadcrumb[data-v-6419bf65] {\n  height: 35px;\n  padding-top: 12px;\n  padding-left: 20px;\n  border-bottom: 1px solid #dadee4;\n  border-top: 1px solid #dadee4;\n  background: #fff;\n  font-size: 13px;\n}\n.tabTask-menu__arrow[data-v-6419bf65] {\n  float: left;\n  background: #ebebeb;\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  /* padding: 0 10px; */\n  margin-left: 5px;\n  -webkit-box-flex: 1;\n  -ms-flex: 1;\n  flex: 1;\n  max-width: 32px;\n  margin-top: 1px;\n  text-align: center;\n  border-top-right-radius: 5px;\n  position: relative;\n  cursor: pointer;\n  /* transition: all 0.3s; */\n}\n.tabTask-menu__pull[data-v-6419bf65] {\n  margin-left: -2px;\n}\n.tabTask-menu__dropItem[data-v-6419bf65] {\n  width: 115px;\n  height: 26px;\n  line-height: 26px;\n  font-size: 13px;\n}\n.tabTask-menu__manage[data-v-6419bf65] {\n  color: #d81e06;\n}\n.tabTask-menu__time[data-v-6419bf65] {\n  font-size: 14px;\n  float: right;\n}\n.tabTask-menu__close[data-v-6419bf65] {\n  display: block;\n  color: #000;\n  float: right;\n  cursor: pointer;\n  width: 15px;\n  height: 15px;\n  line-height: 16px;\n  text-align: center;\n  margin-top: 8px;\n  margin-left: 3px;\n}\n.tabTask-menu__close[data-v-6419bf65] :hover {\n  background: #d81e06;\n  color: #fff;\n  border-radius: 50%;\n}\n.tabTask-menu__refresh[data-v-6419bf65] {\n  /* width: 13px;\n      height: 13px; */\n  font-size: 13px;\n  cursor: pointer;\n  float: right;\n}\n.tabTask-menu__title1[data-v-6419bf65] {\n  background-color: #fff;\n  color: #42494f;\n  cursor: pointer;\n  font-family: 'PingFangSC-Medium';\n  margin-bottom: -1px;\n}\n.tabTask-menu__title2[data-v-6419bf65] {\n  background-color: #fff;\n  color: #42494f;\n  font-family: 'PingFangSC-Regular';\n}\n.tabTask-menu__icon[data-v-6419bf65] {\n  font-size: 26px;\n  -webkit-transition: all 0.3s;\n  -o-transition: all 0.3s;\n  transition: all 0.3s;\n  -webkit-transform: rotate(-90deg);\n  -ms-transform: rotate(-90deg);\n  transform: rotate(-90deg);\n  display: inline-block;\n  position: absolute;\n  top: 15%;\n  right: 12px;\n  margin-top: -7px;\n  color: #333333;\n}\n.tabTask-menu__down[data-v-6419bf65] {\n  display: inline-block;\n  margin: 0 5px;\n  margin-top: -5px;\n  -webkit-transition: all 0.3s;\n  -o-transition: all 0.3s;\n  transition: all 0.3s;\n}\n.tabTask-menu__iconf[data-v-6419bf65] {\n  display: inline-block;\n  vertical-align: middle;\n  margin-right: 5px;\n  width: 24px;\n  text-align: center;\n  font-size: 18px;\n}\n.fl[data-v-6419bf65] {\n  float: left;\n}\n.fr[data-v-6419bf65] {\n  float: right;\n}\n.text-center[data-v-6419bf65] {\n  text-align: center;\n}\n.tabTask-menu__title[data-v-6419bf65] {\n  text-align: center;\n  float: left;\n  width: 58px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.menu-dropdown[data-v-6419bf65] {\n  z-index: 1000;\n  position: absolute;\n  top: 100%;\n  left: -58.5px;\n  padding: 10px 0;\n  margin: 5px 0;\n  background-color: #fff;\n  border: 1px solid #ebeef5;\n  border-radius: 4px;\n  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);\n}\n.menu-dropdown__item[data-v-6419bf65] {\n  list-style: none;\n  line-height: 36px;\n  padding: 0 10px;\n  margin: 0;\n  font-size: 14px;\n  color: #606266;\n  cursor: pointer;\n  outline: 0;\n  overflow: hidden;\n}\n.menu-dropdown__item[data-v-6419bf65]:hover {\n  background: #ecf5ff;\n}\n.menu-dropdown__item-line[data-v-6419bf65] {\n  width: 100%;\n  height: 1px;\n  background: #ebeef5;\n  margin: 6px 0;\n}\n.menu-dropdown__arrow[data-v-6419bf65] {\n  width: 0;\n  height: 0;\n  overflow: hidden;\n  font-size: 0;\n  line-height: 0;\n  border-width: 5px;\n  border-style: solid dashed dashed dashed;\n  border-color: #ebeef5 transparent transparent transparent;\n  transform: rotate(180deg);\n  position: absolute;\n  top: -10px;\n  left: 50%;\n}\n.fade-enter-active[data-v-6419bf65], .fade-leave-active[data-v-6419bf65] {\n  transition: opacity .3s;\n}\n.fade-enter[data-v-6419bf65], .fade-leave-to[data-v-6419bf65] {\n  opacity: 0;\n}\n.tabTask-menu__util[data-v-6419bf65] {\n  float: right;\n  line-break: 26px;\n}\n", map: undefined, media: undefined }), inject("data-v-6419bf65_1", { source: "\n@font-face {font-family: \"dmw-icon\";\n  src: url('iconfont.eot?t=1532589439741'); /* IE9*/\n  src: url('iconfont.eot?t=1532589439741#iefix') format('embedded-opentype'), /* IE6-IE8 */\n  url('data:application/x-font-woff;charset=utf-8;base64,d09GRgABAAAAAAfkAAsAAAAAC1wAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAADMAAABCsP6z7U9TLzIAAAE8AAAARAAAAFZXAkwLY21hcAAAAYAAAACMAAAB9G69SeVnbHlmAAACDAAAA5oAAASIZNEaZGhlYWQAAAWoAAAALgAAADYSHnDpaGhlYQAABdgAAAAeAAAAJAfeA4pobXR4AAAF+AAAABYAAAAgH+oAAGxvY2EAAAYQAAAAEgAAABIF2gQgbWF4cAAABiQAAAAfAAAAIAEbAG5uYW1lAAAGRAAAAU8AAAJtgs0tgHBvc3QAAAeUAAAATwAAAGbMwnTOeJxjYGRgYOBikGPQYWB0cfMJYeBgYGGAAJAMY05meiJQDMoDyrGAaQ4gZoOIAgCKIwNPAHicY2Bk/ss4gYGVgYOpk+kMAwNDP4RmfM1gxMjBwMDEwMrMgBUEpLmmMDgwVLySYm7438AQw9zEMAUozAiSAwAoAwyleJzFkbENhDAMRb8vIUjRFVczA5MwxFWUDMAMV7EgrYVYAr5jJEC6nm+9SP8rcaIYQAUgkJZEQCYITD+mUvKAXPKIL/2HZftHDZq103kZ1mbb/iZXSTl5liURL/aqUCPRJjwmee7qu95l7Q9Xk/GAT9Tg2Jw0O/xBaOfYXHR2bK7L4FiftXGQdgZPJjx4nF1SS2sbVxS+515pZu5II2kemmuPI9sj2TP1o8J6jdIqsUQoMS0NtAQZSjc12aRJGroweNHiTgyFLrzoqnQRg2kLhmrRRfAuC6WQVbptCoFAS7ts+gNCddNz5UBLhxnueXzzHc53P5Il5MVv7D6bIS55hTTIG+QdQkBbg2qBViCM23W6BuUwWxZegcW1ONRr1Tq7CKKqeX4zaUdC07UiFGAeWmEzies0hk57k/ag6VcAZueCq87yOYd9CeZMPP+5fIt+A+WF2rni5qvyzfW+11x0jb2848w6zqGhZbMGpZliAT4SPs9yU5PfZYtB+f7CCl2A/GwcvP2etTjn7HzRvl1ZFhwgTcGdWyyc9O3AxvfTwHedWb1kGTOBVVvyYO+P3Iybr0S/E3wAd73FHtA/yRwmod2OqlrZDtUmrdBW63TsUO3ETuRu0S/K3VyxmINDDOEQQ7g8PXL/bypujtwp+4qlxCA2mSUVskp6pE+ukPdxVm0TuuUC6lirQ9yZB1EOOy31LbfKtWxYjdoJqud7Wo1hEtsID+ehbGNhObRDtxp17HbS9KeV1hmi6Qu7ADW4uU23uq6A4RCEe34L5HAbyFD+PBrB4wnxhPAYcYVwtycjRCGGDlVx8pgSSb7HTozZWSua9hlBFkWmSGHrfJquraXDkcLFYkKER4dnRJORJ4bIsi1cmA56MR30b/xS86fsW1ZTmoccUN2qzgGV9/D+lIe6HJSR2JFMYV+zSpo8kAdaydJgX6YqhxRSzOEOfKbKUp0KdkdOc1CnVcJZFGfts2fsgGyQHRwdLekF0DvtOmgV2GiUNxqofGsTOo12tAaocZIReLWa32r4SR8SttGoAzpf0xHYAzT2UlyHbjuJ4kaEmS/8TFfd5Dw0k25no8F+6ssfHvY/XM1bFnB+ZORyxsfRtddPodOrlLLUNHSLZp3rwM273AQw+a0ru6fyUa+omdlps5Bx+/Duw/6NVchbeaDmj6eJc2n9JqJ57m5G4+onI7eyabdO7l3bCfQiGHrlunykmTmDm1eXmyf3OjeamlUAMIzXPrn44DRxL63f5qaRO3rpeULYc/o1upLAf8RH0bu48nM34PKCvMAD14QnPODwxKR7lsvlCvzC3cCUDufwF1c0GdR3zMZsQBjRiUU8Qlw7tBk6FOzYDmMQuugKe8zIYJLSdEIGbHEgB8fjD8bHbDDB3yYDVabHg79/xWjagGOk/geS79IXAAB4nGNgZGBgAOI2f+6ueH6brwzcLAwgcL1+Wj2C/p/DwsDcBORyMDCBRAEWbwnvAAB4nGNgZGBgbvjfwBDDAmQxMLAwMIBpJMABAEcnAnIAAHicY2FgYGB+ycDAwoCEGRFsABriAQoAAAAAAAAAdgCkATABZgHwAhYCRAAAeJxjYGRgYOBgSGLgZAABJiDmAkIGhv9gPgMAE4MBigB4nGWPT07CQBjFX/mnlsQQie5MZmFcqJQ/ccXGBQnsWbCHdgolbaeZDhAO4Hk8gifwCHoD7+CjTF1Am5n+3pv3ffMVwA1+4OD43HId2cEl1ZEruMC95Sr9B8s18ovlOpp4tdyg/2bZxTMmlptoQ7ODU7uiesK7ZQctfFiu4Bqflqv0vyzXyN+W67jDr+UGWk7VsouZ07bcxKMTuSMt50YGYrEXka/SUKXGDZJd5yCmcrmJ57qU5XcmdR6pVPS9XmlNZCp12SffLgfGhCLUKhFjNpRxrESm1Vr6xlsZkw273dD6nq8SjjXib0vMYbgHEFhgzz2CD4UUYbEb5gIk2KHzfzJlfokNYtbqs9NTPWNaI6c+KIE+PPTOUhOm0iJ5Ok+OLW8b0DWcSXBpViSksZ1QcpKYLJAVZ2s6Pn0Pq6IqwxBdvuFJ3ivuTv4A5yFsuAB4nG3IWwqAIBAF0Lmaj9yLi5KcKCiFEZqWX9Bv5/OQoU+ifxEGFhMcPAIiZsJtS61e+OwXu+Xog4PwKjy2VLu2XES6psaadW/vED3TpxHGAA==') format('woff'),\n  url('iconfont.ttf?t=1532589439741') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/\n  url('iconfont.svg?t=1532589439741#dmw-icon') format('svg'); /* iOS 4.1- */\n}\n.dmw-icon {\n  font-family:\"dmw-icon\" !important;\n  font-size:16px;\n  font-style:normal;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n.icon-add:before { content: \"\\e60a\";\n}\n.icon-remove:before { content: \"\\e64a\";\n}\n.icon-close:before { content: \"\\e603\";\n}\n.icon-refresh:before { content: \"\\e6dd\";\n}\n.icon-down-arrow:before { content: \"\\ea1a\";\n}\n.icon-new-window:before { content: \"\\e86c\";\n}\n\n", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-6419bf65";
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* component normalizer */
  function __vue_normalize__(
    template, style, script$$1,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    var component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

    {
      component.__file = "/Users/hua/Desktop/ddv-multi-window2/src/components/task.vue";
    }

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) { component.functional = true; }
    }

    component._scopeId = scope;

    {
      var hook;
      if (style) {
        hook = function(context) {
          style.call(this, createInjector(context));
        };
      }

      if (hook !== undefined) {
        if (component.functional) {
          // register for functional component in vue file
          var originalRender = component.render;
          component.render = function renderWithStyleInjection(h, context) {
            hook.call(context);
            return originalRender(h, context)
          };
        } else {
          // inject component registration as beforeCreate hook
          var existing = component.beforeCreate;
          component.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
      }
    }

    return component
  }
  /* style inject */
  function __vue_create_injector__() {
    var head = document.head || document.getElementsByTagName('head')[0];
    var styles = __vue_create_injector__.styles || (__vue_create_injector__.styles = {});
    var isOldIE =
      typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

    return function addStyle(id, css) {
      if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) { return } // SSR styles are present.

      var group = isOldIE ? css.media || 'default' : id;
      var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

      if (!style.ids.includes(id)) {
        var code = css.source;
        var index = style.ids.length;

        style.ids.push(id);

        if (isOldIE) {
          style.element = style.element || document.querySelector('style[data-group=' + group + ']');
        }

        if (!style.element) {
          var el = style.element = document.createElement('style');
          el.type = 'text/css';

          if (css.media) { el.setAttribute('media', css.media); }
          if (isOldIE) {
            el.setAttribute('data-group', group);
            el.setAttribute('data-next-index', '0');
          }

          head.appendChild(el);
        }

        if (isOldIE) {
          index = parseInt(style.element.getAttribute('data-next-index'));
          style.element.setAttribute('data-next-index', index + 1);
        }

        if (style.element.styleSheet) {
          style.parts.push(code);
          style.element.styleSheet.cssText = style.parts
            .filter(Boolean)
            .join('\n');
        } else {
          var textNode = document.createTextNode(code);
          var nodes = style.element.childNodes;
          if (nodes[index]) { style.element.removeChild(nodes[index]); }
          if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }
          else { style.element.appendChild(textNode); }
        }
      }
    }
  }
  /* style inject SSR */
  

  
  var Task = __vue_normalize__(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    __vue_create_injector__,
    undefined
  )

var LoadComponent = {
  name: 'ddv-multi-window-load',
  render: function render (_c) {
    return _c('section', [_c('div', {}, ['加载中...'])])
  }
}

function clone (value) {
  if (Array.isArray(value)) {
    return value.map(clone)
  } else if (value && typeof value === 'object') {
    var res = {};
    for (var key in value) {
      res[key] = clone(value[key]);
    }
    return res
  } else {
    return value
  }
}

function cloneRenderOptions (options, defaultOptions) {
  return getRenderOptions(clone(defaultOptions), clone(options))
}
function getRenderOptions (o, d) {
  Object.keys(d || {}).forEach(function (key) {
    if (typeof o[key] === 'object') {
      o[key] = getRenderOptions(o[key], d[key]);
    } else {
      o[key] = unDefDefault(o[key], d[key]);
    }
  });
  return o
}

var ErrorComponent = LoadComponent;
function render (h) {
  if (!this.ready) {
    return
  }
  var children = this.$slots.default ? Array.prototype.concat(this.$slots.default) : [];

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
  ]));
  // 进程div - 核心进程
  return h('div', cloneRenderOptions(this.renderOptions.root, {
    key: 'root',
    attrs: {
      id: 'dmw_daemon_' + this.id,
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
  var this$1 = this;

  // 所有任务栏的任务集合
  return this.taskIds.map(function (pid) {
    var task = this$1.process[pid];
    // 判断该进程id是否是 一个有视图的进程
    if (!task || !task.isTask) {
      // 既然没有视图，不需要渲染
      return
    }

    // 把视图插入视图集合
    return h('div', cloneRenderOptions(this$1.renderOptions.taskParent, {
      key: pid,
      ref: 'tp_' + pid,
      attrs: {
        'process-id': pid,
        'ddv-multi-window-type': 'taskParent'
      }
    }), [
      h('div', cloneRenderOptions(this$1.renderOptions.taskBox, {
        key: 'task',
        ref: 'tb_' + pid,
        attrs: {
          'process-id': pid,
          'ddv-multi-window-type': 'taskBox'
        }
      }), [taskChildrenRender.call(this$1, h, task)])
    ])
  })
}
function mainChildren (h) {
  var this$1 = this;

  // 窗口集合
  return this.taskIds.map(function (taskId) {
    var task = this$1.process[taskId];
    // 判断该进程id是否是 一个有视图的进程
    if (!task || !task.isTask) {
      // 既然没有视图，不需要渲染
      return
    }

    // 把视图插入视图集合
    return h('div', cloneRenderOptions(this$1.renderOptions.mainParent, {
      key: taskId,
      ref: 'mp_' + taskId,
      attrs: {
        'task-id': taskId,
        'ddv-multi-window-type': 'mainParent'
      }
    }), [
      h('div', cloneRenderOptions(this$1.renderOptions.mainBox, {
        key: 'main',
        ref: 'mb_' + taskId,
        attrs: {
          'task-id': taskId,
          'ddv-multi-window-type': 'mainBox'
        }
      }), (this$1.viewIds || []).map(function (pid) { return h('div', cloneRenderOptions(this$1.renderOptions.mainContent, {
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
          value: task && pid === task.activeId
        }]
      })); }))
    ])
  })
}
function taskChildrenRender (h, task) {
  var props = {
    task: task,
    process: this.process,
    handleTask: this.handleTask
  };
  if (this.$scopedSlots && this.$scopedSlots.task) {
    return this.$scopedSlots.task(props)
  } else if (this.$slots && this.$slots.task.length) {
    this.$slots.task[0].data.props = props;
    console.log(this.$slots.task, 89, h('div', { props: props }));
    return [this.$slots.task]
  }
  var task1 = (this.$slots && this.$slots.task.length) ? this.$slots.task : h('div');
  return [task1]

  /* return this.taskIds.map(pid => {
    const task = this.process[pid]
    // 判断该进程id是否是 一个有视图的进程
    if (!task || !task.isTask) {
      // 既然没有视图，不需要渲染
      return
    }
  }) */
}
function viewChildren (h) {
  var this$1 = this;

  return this.viewIds.map(function (pid) {
    var pitem = this$1.process[pid];
    // 判断该进程id是否是 一个有视图的进程
    if (!pitem || !pitem.isHasView) {
      // 既然没有视图，不需要渲染
      return
    }
    // 该窗口[视图]的子元素
    var children = [];
    if (!pitem.init) {
      children.push(h(LoadComponent, cloneRenderOptions(this$1.renderOptions.viewLoad, {
        key: 'load',
        attrs: {
          'process-id': pid,
          'ddv-multi-window-type': 'loadBox'
        }
      })));
    } else if (pitem.error) {
      children.push(h(ErrorComponent, cloneRenderOptions(this$1.renderOptions.viewError, {
        key: 'error',
        attrs: {
          'process-id': pid,
          'ddv-multi-window-type': 'errorBox'
        },
        props: {
          error: this$1.error
        }
      })));
    } else if (pitem.mode === 'component') {
      if (pitem.component) {
      // 视图模式 为 vue 组件视图
        children.push(h(pitem.component, cloneRenderOptions(this$1.renderOptions.viewComponent, {
          props: {
          }
        })));
      } else {
        pitem.init = false;
        this$1.loadComponent(pid)
          .then(function () {
            pitem.init = true;
          })
          .catch(function (error) {
            pitem.error = error;
          });
      }
      // 插入一个 iframe 的渲染
      // children.push(h('iframe', data))
    } else if (pitem.mode === 'iframe') {
      // 插入一个 iframe 的渲染
      children.push(h('iframe', cloneRenderOptions(this$1.renderOptions.viewIframe, {
        // 修改key
        key: 'iframe',
        // 修改ref
        ref: 'if_' + pid,
        on: {
          // 加载完成事件
          load: function (event) { return this$1.dmw$handleIframeLoad(event, pid); }
        },
        attrs: {
          // 窗口的地址
          src: pitem.src,
          // 窗口的id
          'process-id': pid,
          // 类型
          'ddv-multi-window-type': 'iframe'
        }
      })));
    }
    // 把视图插入视图集合
    return h('div', cloneRenderOptions(this$1.renderOptions.viewParent, {
      key: pid,
      ref: 'vp_' + pid,
      attrs: {
        'process-id': pid,
        'ddv-multi-window-type': 'viewParent'
      }
    }), [
      h('div', cloneRenderOptions(this$1.renderOptions.viewBox, {
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

var base = {
  data: function data () {
    return {
      // 拖拽id
      dragData: {
        id: null
      },
      // 进程键值对
      process: {}
    }
  },
  computed: {
    id: function id () {
      return this.daemonId
    },
    // 初始化完毕
    ready: function ready () {
      return this.process.daemon.init
    },
    // 所有进程id集合
    pids: function pids () {
      return Object.keys(this.process || {}) || []
    },
    // 任务栏进程id集合
    taskIds: function taskIds () {
      var this$1 = this;

      return this.pids.filter(function (pid) { return (this$1.process[pid] && this$1.process[pid].isTask); })
    },
    // 视图进程id集合
    viewIds: function viewIds () {
      var this$1 = this;

      return this.pids.filter(function (pid) { return (this$1.process[pid] && this$1.process[pid].isHasView); })
    },
    // 拖动中的进程
    dragProcess: function dragProcess () {
      return this.dragId ? (this.process[this.dragId] || null) : null
    }
  },
  created: function created () {
    // 注入进程
    this.processPut({
      id: 'daemon',
      mode: 'daemon',
      isTask: true,
      isHasView: false,
      hasContentWindow: true,
      contentWindow: this.$ddvMultiWindowGlobal.contentWindow
    });
    // 守护进程的id
    this.$ddvMultiWindowGlobal.daemonInit(this);
    // 设为初始化完毕
    this.process.daemon.init = true;
  }
}

function sleep (timeout) {
  return new Promise(function (resolve) { return setTimeout(resolve, timeout); })
}

function findOrSleepCall (obj, refName, tryNumMax, tryNum) {
  tryNumMax = tryNumMax || 50;
  if (tryNum > tryNumMax) {
    console.error(obj, refName);
    return Promise.reject(new Error('查找失败'))
  } else {
    tryNum = (tryNum || 0) + 1;
  }
  if (obj[refName]) {
    return Promise.resolve(obj[refName])
  }
  return sleep(60).then(function (_) { return findOrSleepCall(obj, refName, tryNumMax, tryNum); })
}

var $$1 = require('jquery');

var api = {
  methods: {
    regTask: function regTask (taskId) {
      // 试图拿到该任务栏
      var task = this.process[taskId];
      if (!task) {
        throw new Error('没有找到任务栏窗口')
      }
      if (!(task.isTask && Array.isArray(task.pids))) {
        this.$set(task, 'isTask', true);
        this.$set(task, 'pids', []);
        this.$set(task, 'history', []);
        this.$set(task, 'activeId', null);
      }
    },
    addTask: function addTask (ref) {
      var taskId = ref.taskId;
      var id = ref.id;

      // 试图拿到该任务栏
      var pids = this.process[taskId].pids;
      pids.indexOf(id) > -1 || pids.push(id);
    },
    refreshTask: function refreshTask (ref) {
      var this$1 = this;
      var taskId = ref.taskId;
      var id = ref.id;

      (this.taskIds || []).forEach(function (tid) {
        var task = this$1.process[tid];
        if (task && tid !== taskId) {
          task.pids = task.pids.filter(function (pid) {
            return pid !== id
          });
          task.history = task.history.filter(function (pid) {
            return pid !== id
          });
        }
      });
    },
    windowAppendChild: function windowAppendChild (ref, tryNum) {
      var this$1 = this;
      var id = ref.id;
      var taskId = ref.taskId;
      var autoToTab = ref.autoToTab;

      if (tryNum > 50) {
        return Promise.reject(new Error('查找失败'))
      } else {
        tryNum = (tryNum || 0) + 1;
      }
      var item, taskIdLast;
      if (!(id && (item = this.process[id]))) {
        return Promise.resolve()
      }
      if (item.removeing) {
        return Promise.resolve()
      }
      if (!(item.$mainWrap && item.$mainWrap[taskId])) {
        return sleep(350).then(function () { return this$1.windowAppendChild({ id: id, taskId: taskId, autoToTab: autoToTab }, tryNum); })
      }
      item.$mainWrap[taskId].append(item.$content);
      taskIdLast = item.taskId;
      item.taskId = taskId;

      if (autoToTab === false) {
        return Promise.resolve()
      } else {
        return this.tabToWindow(id)
          .then(function () {
            this$1.refreshTask({ taskId: taskId, id: id });
            return this$1.tabToLastWindowByTaskId(taskIdLast || 'daemon')
          })
      }
    },
    viewMoveParentByPid: function viewMoveParentByPid (id) {
      var process = this.process[id];
      if (process && process.$parent && process.$parent.length && process.$content && process.$content.length) {
        process.$parent.append(process.$content);
      }
    },
    closeMasterWindow: function closeMasterWindow (taskId, isCloseMaster) {
      var this$1 = this;

      var task = this.process[taskId || 'daemon'];
      if (!task) {
        return
      }
      this.masterMoveParentByTaskId(taskId);
      if (isCloseMaster === true) {
        var taskDaemon = this.process.daemon;
        var activeId = task.activeId;
        if (task.mode !== 'master') {
          return
        }
        (task.history || []).forEach(function (id) {
          taskDaemon.history.indexOf(id) > -1 || taskDaemon.history.push(id);
        });
        return Promise.all((task.pids || []).map(function (id) {
          this$1.addTask({ taskId: 'daemon', id: id });
          return this$1.windowAppendChild({ taskId: 'daemon', id: id, autoToTab: false })
        }))
          .then(function () {
            task.pids.length = 0;
            return this$1.refreshTask({ taskId: 'daemon', id: activeId })
          })
      } else if (isCloseMaster === void 0) {
        clearTimeout(task.closeMasterTimer);
        task.closeMasterTimer = setTimeout(function () {
          this$1.closeMasterWindow(taskId, true);
        }, 5000);
      }
    },
    closeAllMasterWindow: function closeAllMasterWindow () {
      var item = this.$ddvMultiWindowGlobal && this.$ddvMultiWindowGlobal.map && this.$ddvMultiWindowGlobal.map[this.daemonId] && this.$ddvMultiWindowGlobal.map[this.daemonId].api;
      this.taskIds.forEach(function (taskId) {
        Object.keys(item).forEach(function (taskId) {
          item && item[taskId] && typeof item[taskId].onDaemonClose === 'function' && item[taskId].onDaemonClose();
        });
      });
    },
    masterMoveParentByTaskId: function masterMoveParentByTaskId (taskId) {
      var task = taskId && this.process[taskId];
      if (!task) {
        return
      }
      if (task.$mainParent && task.$mainContent) {
        task.$mainParent.append(task.$mainContent);
      }
      if (task.$taskParent && task.$taskContent) {
        task.$taskParent.append(task.$taskContent);
      }
    },
    masterViewInit: function masterViewInit (view, taskId, $wrap) {
      var this$1 = this;

      var task = this.process[taskId];
      var mountKey;
      if (view === 'view') {
        mountKey = '$mainContent';
      } else if (view === 'task') {
        mountKey = '$taskContent';
      }
      if (!task) {
        return Promise.reject(getError('进程不存在'))
      }
      clearTimeout(task.closeMasterTimer);
      if (!task[mountKey]) {
        return findOrSleepCall(task, mountKey).then(function () { return this$1.masterViewInit(view, taskId, $wrap); })
      }
      if (!task[mountKey].length) {
        return Promise.reject(getError('任务栏中没有找到挂载点'))
      }
      if (!($wrap && $$1($wrap).length)) {
        return Promise.reject(getError('进程不存在'))
      }
      $wrap.append(task[mountKey]);
      return Promise.resolve()
    }
  }
}

var util$1 = require('ddv-auth/util');

function createNewPid (params) {
  return util$1.createNewPid()
}

var apiUtil = {
  methods: {
    // 参数运行函数
    tryRun: function tryRun (fn) {
      var this$1 = this;

      return this._dmw$tryRun(fn)
        .catch(function (e) {
          if (this$1.errorHooks.length) {
            // 如果有错误监听就直接反馈
            return Promise.all(this$1.errorHooks.map(function (fn) { return fn && fn(e); }))
          } else {
            // 否则传回上层
            return Promise.reject(e)
          }
        })
    },
    // 参数运行函数-正式
    _dmw$tryRun: function _dmw$tryRun (fn) {
      if (typeof fn === 'function') {
        try {
          var res = fn();
          return (res && res.then) ? res : Promise.resolve(res)
        } catch (e) {
          return Promise.reject(e)
        }
      }
      return Promise.resolve()
    },
    createPid: function createPid (ref) {
      var mode = ref.mode;

      return (mode || 'child') + createNewPid()
    },
    // 是否存在窗口
    isHasId: function isHasId (pid) {
      return this.pids.indexOf(pid) > -1
    },
    checkPid: function checkPid (pid, tryNumMax, tryNum) {
      var this$1 = this;

      var isPromise = tryNumMax !== 0;
      if (isPromise && tryNum > tryNumMax) {
        return throwError('Window does not exist', 'WINDOW_NOT_EXIST', isPromise)
      } else {
        tryNum = (tryNum || 0) + 1;
      }
      if (!this.isHasId(pid)) {
        if (isPromise) {
          return sleep(150)
            .then(function () { return this$1.checkPid(pid, tryNumMax, tryNum); })
        } else {
          return throwError('Window does not exist', 'WINDOW_NOT_EXIST', isPromise)
        }
      }
      return isPromise ? Promise.resolve() : void 0
    },
    // 获取windowId-通过iframe的window来获取所属的windowId
    getPidByWindow: function getPidByWindow (cw, tryNumMax, tryNum) {
      var this$1 = this;

      var isPromise = tryNumMax !== 0;
      tryNumMax = unDefDefault(tryNumMax, 50);
      if (isPromise && tryNum > tryNumMax) {
        return throwError('Find pid based on window', 'FIND_PID_FAIL_BY_CW', isPromise)
      } else {
        tryNum = (tryNum || 0) + 1;
      }
      var pid, process, hasClosed;
      for (pid in this$1.process) {
        process = this$1.process[pid];
        if (process.hasContentWindow) {
          if (!process.contentWindow || process.contentWindow.closed) {
            hasClosed = true;
          } else if (process.contentWindow === cw) {
            return isPromise ? Promise.resolve(pid) : pid
          }
        }
      }
      if (isPromise && hasClosed) {
        if (isPromise) {
          return this.dmw$handleContentWindowLoad()
            .then(function () { return sleep(150); })
            .then(function () { return this$1.getPidByWindow(cw, tryNumMax, tryNum); })
        } else {
          return throwError('Process contentWindow not has init or closed', 'PROCESS_CW_NOT_INIT_OR_CLOSED', isPromise)
        }
      }
      return throwError('window not found', 'WINDOW_NOT_FINT', isPromise)
    },
    getWindowByPid: function getWindowByPid (pid, tryNumMax, tryNum) {
      var this$1 = this;

      var isPromise = tryNumMax !== 0;
      tryNumMax = unDefDefault(tryNumMax, 50);
      if (isPromise && tryNum > tryNumMax) {
        return throwError('Find window  based on pid', 'FIND_CW_FAIL_BY_PID', isPromise)
      } else {
        tryNum = (tryNum || 0) + 1;
      }
      if (!pid) {
        return throwError('must input pid', 'MUST_INPUT_PID', isPromise)
      }
      var process = this.process[pid];
      if (process) {
        if (process.hasContentWindow) {
          if (!process.contentWindow || process.contentWindow.closed) {
            if (isPromise) {
              return this.dmw$handleContentWindowLoad()
                .then(function () { return sleep(150); })
                .then(function () { return this$1.getWindowByPid(pid, tryNumMax, tryNum); })
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
    processPut: function processPut (item) {
      // 获取到进程id
      item.id = item.id || item.pid;
      var data = {
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
      };
      this.$set(this.process, item.id, unDefDefaultByObj(item, data));
    },
    // 路由准备完毕
    routerReady: function routerReady () {
      var this$1 = this;

      return new Promise(function (resolve, reject) { return this$1.$router.onReady(resolve, reject); })
    },
    loadComponent: function loadComponent (pid) {
      var this$1 = this;

      console.log('加载加载');
      var item = this.process[pid];
      // 判断该进程id是否是 一个有视图的进程
      if (!item || !item.isHasView) {
        // 既然没有视图，不需要渲染
        return Promise.reject(getError('不支持显示'))
      }
      if (item.mode !== 'component') {
        return Promise.reject(getError('不支持加载'))
      }

      item.error = null;
      return this.routerReady()
        .then(function () { return (this$1.$router.getMatchedComponents(item.src)); })
        .then(function (matchedComponents) {
          if (!matchedComponents.length) {
            var e = new Error('404');
            e.statusCode = 404;
            return Promise.reject(e)
          }
          return Promise.all(matchedComponents.map(function (Component) {
            return Component()
          }))
        })
        .then(function (components) {
          item.component = Object.create(components[0]);
          item.component.router = this$1.loadComponentRouter();
        })
        .catch(function (e) {
          item.error = e;
        })
    },

    loadComponentRouter: function loadComponentRouter () {
      var router = Object.create(this.$router);
      /* Object.assign(router, tabRouter, {
        $parentRouter: this.$router
      })*/
      return router
    }
  },
  components: {
  },
  computed: {
  },
  watch: {
  },
  beforeCreate: function beforeCreate () {
  },
  created: function created () {
  },
  mounted: function mounted () {
  }
}

var apiProps = {
  props: {
    daemonId: {
      type: [Number, String],
      default: 'daemon'
    },
    // 以下类型的窗口没有所属任务栏
    modeNotTasks: {
      type: Array,
      default: function default$1 () {
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
    // process的默认配置项[options]
    renderOptions: {
      type: Object,
      default: function default$2 () {
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

function getDaemonWindow (w) {
  w = getWindow(w);
  var host, daemonWindow;
  try {
    host = w.location.host;
  } catch (e) { }
  if (!daemonWindow || daemonWindow === w) {
    try {
      // 试图获取浏览器顶层的
      if (w.parent && w.parent.location && host === w.parent.location.host) {
        try {
          // 试图获取浏览器顶层的
          if (w.parent.$ddvUtil && w.parent.$ddvUtil.$daemonWindow && w.parent.$ddvUtil.$daemonWindow.location && host === w.parent.$ddvUtil.$daemonWindow.location.host) {
            daemonWindow = w.parent.$ddvUtil.$daemonWindow;
          }
        } catch (e) {
        }
      }
    } catch (e) {
    }
  }
  if (!daemonWindow || daemonWindow === w) {
    try {
      // 试图获取浏览器顶层的
      if (w.top && w.top.location && host === w.top.location.host) {
        try {
          // 试图获取浏览器顶层的
          if (w.top.$ddvUtil && w.top.$ddvUtil.$daemonWindow && w.top.$ddvUtil.$daemonWindow.location && host === w.top.$ddvUtil.$daemonWindow.location.host) {
            daemonWindow = w.top.$ddvUtil.$daemonWindow;
          }
        } catch (e) {
        }
        if (!daemonWindow) {
          daemonWindow = w.top;
          try {
            // 试图获取浏览器顶层的
            if (w.top.opener && w.top.opener.location && host === w.top.opener.location.host) {
              daemonWindow = w.top.opener;
            }
          } catch (e) {
          }
        }
      }
    } catch (e) {
    }
  }
  if (!daemonWindow || daemonWindow === w) {
    try {
      // 试图获取浏览器顶层的
      if (w.parent && w.parent.location && host === w.parent.location.host) {
        daemonWindow = w.parent;
        try {
          // 试图获取浏览器顶层的
          if (w.parent.opener && w.parent.opener.location && host === w.parent.opener.location.host) {
            daemonWindow = w.parent.opener;
          }
        } catch (e) {
        }
      }
    } catch (e) {
    }
  }
  if (!daemonWindow || daemonWindow === w) {
    try {
      // 试图获取浏览器顶层的
      if (w.opener && w.opener.location && host === w.opener.location.host) {
        try {
          // 试图获取浏览器顶层的
          if (w.opener.$ddvUtil && w.opener.$ddvUtil.$daemonWindow && w.opener.$ddvUtil.$daemonWindow.location && host === w.opener.$ddvUtil.$daemonWindow.location.host) {
            daemonWindow = w.opener.$ddvUtil.$daemonWindow;
          }
        } catch (e) {
        }
        if (!daemonWindow) {
          daemonWindow = w.opener;
          try {
            // 试图获取浏览器顶层的
            if (w.opener.opener && w.opener.opener.location && host === w.opener.opener.location.host) {
              daemonWindow = w.opener.opener;
            }
          } catch (e) {
          }
        }
      }
    } catch (e) {
    }
  }
  if (daemonWindow && daemonWindow !== w) {
    daemonWindow = getDaemonWindow(daemonWindow);
  }
  if (!daemonWindow) {
    daemonWindow = w;
  }
  return daemonWindow
}
function getWindow (win) {
  if (win) {
    contentWindow = win;
  }
  if (!win && typeof window !== typeof void 0) {
    contentWindow = window;
  }
  if (!contentWindow) {
    throw getError('没有找到窗口')
  }
  return contentWindow
}
function openWindow (url, options, win) {
  var contentWindow;
  if (!win) {
    if (typeof window !== 'undefined' && window.window === window) {
      win = window;
    } else {
      throw getError('window must input', 'WINDOW_MUST_INPUT')
    }
  }
  try {
    contentWindow = win.open(url, options.name || '', stringify(configure(options, win)));
  } catch (e) {
  }
  if (contentWindow) {
    return contentWindow
  }
  throw getError('open window fail', 'OPEN_WINDOW_FAIL')
}
function stringify (obj) {
  var parts = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      parts.push(key + '=' + obj[key]);
    }
  }
  return parts.join(',')
}

function configure (options, win) {
  options = options || {};
  options.width = options.width || 640;
  options.height = options.height || 480;
  options.left = options.left || win.screenX + ((win.outerWidth - options.width) / 2);
  options.top = options.top || win.screenY + ((win.outerHeight - options.height) / 2.5);
  return options
}

var contentWindow;

var apiTab = {
  methods: {
    // 切换窗口
    tabToWindow: function tabToWindow (pid) {
      if (!this.isHasId(pid)) {
        return Promise.reject(getError('窗口不存在'))
      }
      // 取得任务栏 - 先试图从该窗口进程中找到任务栏id，如果没有就是有默认任务栏
      var task = this.process[this.process[pid].taskId || 'daemon'];
      // 任务栏中把激活的窗口id设为传入id
      task.activeId = pid;
      // 任务栏 的 历史 中 去除这个 id
      removeArray(task.history, function (item) { return item === pid; });
      // 把这个id 插入到历史的最前方
      task.history.unshift(pid);
      return Promise.resolve()
    },
    // 切换窗口
    tabToLastWindowByTaskId: function tabToLastWindowByTaskId (taskId) {
      var task = this.process[taskId || 'daemon'];
      // 获取上一个历史的id
      return task && task.history[0] && this.tabToWindow(task.history[0])
    },
    tabMoveMasterWindow: function tabMoveMasterWindow (ref) {
      var taskId = ref.taskId;
      var id = ref.id;

      this.regTask(taskId);
      this.addTask({ taskId: taskId, id: id });
      return this.windowAppendChild({ taskId: taskId, id: id })
    },
    openMasterWindow: function openMasterWindow (id) {
      try {
        var taskId = this.createPid({ mode: 'master' });
        var contentWindow$$1 = openWindow(this.openMasterWindowSrc, {
          name: taskId
        }, this.daemonWindow || this.contentWindow);
        this.processPut({
          id: taskId,
          mode: 'master',
          isTask: true,
          isHasView: false,
          hasContentWindow: true,
          contentWindow: contentWindow$$1
        });
        return this.tabMoveMasterWindow({ id: id, taskId: taskId })
      } catch (e) {
        return Promise.reject(e)
      }
    }
  }
}

var apiAction = {
  methods: {
    open: function open (input) {
      // 构建配置选项
      var options = Object.create(null);
      // 如果传入参数是一个字符串
      if (typeof input === 'string') {
        // 路径
        options.src = input;
        // 传入的
        options.options = {
          // 打开的窗口的路径
          src: input
        };
      } else if (typeof input === 'object') {
        // 遍历属性
        for (var key in input) {
          if (Object.hasOwnProperty.call(input, key)) {
            // 复制属性
            options[key] = input[key];
          }
        }
        options.options = input;
      }
      if (!options.mode) {
        var matchedComponents = this.$router.getMatchedComponents(options.src);
        options.mode = matchedComponents.length ? 'component' : 'iframe';
      }
      // 窗口类型
      options.mode = options.mode || 'iframe';
      // 创建窗口id
      if (!options.id) {
        options.id = this.createPid({
          mode: options.mode
        });
      }
      // 判断是否在任务栏上显示，如果找不到排除就是需要显示
      options.isHasTask = this.modeNotTasks.indexOf(options.mode) === -1;
      // 是否有浏览器的全局窗口对象
      options.hasContentWindow = typeof options.hasContentWindow === 'undefined' ? ['iframe', 'daemon', 'master'].indexOf(options.mode) > -1 : options.hasContentWindow;
      // 把值为undefined使用后面的对象的默认值
      unDefDefaultByObj(options, {
        // 路径
        src: '/',
        // 标题
        title: 'New window',
        // 是否可以关闭
        closable: true,
        // 是否可以刷新
        refreshable: false,
        // 是否正在移除中
        removeing: false,
        // 窗口
        contentWindow: null,
        // 视图的 可拖动的dom，是一个属性不变的jquery dom - 注意，不能去改变属性，避免vue重新渲染
        $content: null,
        // iframe 的 jquery
        $iframe: null,
        // 视图的 父层 jquery dom 不会改变，第一次的父层 - 注意，不能去改变属性，避免vue重新渲染
        $parent: null,
        // 注入到那个具体窗口的容器
        $mainWrap: {},
        // 组件
        component: null
      });
      // 标题
      options.title = options.title || ("新窗口[id:" + (options.id) + "]");
      // 判断一下 - 如果打开的窗口类型需要任务栏的，并且任务栏中找不到任务栏id
      if (options.isHasTask && !(this.process[options.taskId] && this.process[options.taskId].isTask)) {
        // 使用守护窗口任务栏
        options.taskId = 'daemon';
      }
      // 需要任务栏
      if (options.isHasTask) {
        // 是否有这个任务 - 没有这个任务，注册任务
        this.regTask(options.taskId);
        // 添加任务栏的任务
        this.addTask({
          taskId: options.taskId,
          id: options.id
        });
      }
      // 修改窗口数据
      this.processPut(options);
      // 判断是否需要切换到这个tab标签
      return this.tabToWindow(options.id)
    },
    remove: function remove (id) {
      var this$1 = this;

      var process = this.process[id];

      if (!this.isHasId(id)) {
        return Promise.reject(new Error('this window is not found'))
      }
      process.removeing = true;

      this.viewMoveParentByPid(id);
      this.taskIds.forEach(function (taskId) {
        var task = this$1.process[taskId];
        if (task) {
          // 移除任务栏
          removeArray(task.pids, function (item) { return item === id; });
          // 移除任务栏历史
          removeArray(task.history, function (item) { return item === id; });
        }
      });
      // 删除内容
      this.$delete(this.process, id);
      // 切换到任务栏的上一个
      return this.tabToLastWindowByTaskId(process.taskId || 'daemon')
    },
    refresh: function refresh (id) {
      var process = this.process[id];

      if (!this.isHasId(id)) {
        return Promise.reject(new Error('this window is not found'))
      }

      if (process.mode === 'component') {
        if (process.component) {
          process.component.reload();
        }
      } else if (process.mode === 'iframe') {
        return this.getWindowByPid(id)
          .then(function (ref) {
            var contentWindow = ref.contentWindow;

            contentWindow.location.reload(true);
          })
      } else {
        return Promise.reject(new Error('window does not support refresh'))
      }
    }
  }
}

var $$2 = require('jquery');

var handle = {
  methods: {
    dmw$iframeLoad: function dmw$iframeLoad (id, isReload) {
      var this$1 = this;

      var item;
      if (!(id && (item = this.process[id]))) {
        return Promise.resolve()
      }
      if (item.mode !== 'iframe' || item.removeing) {
        return Promise.resolve()
      }
      return Promise.resolve()
        .then(function () {
          if (!item.$iframe) {
            return findOrSleepCall(this$1.$refs, 'if_' + id)
              .then(function (ref) {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref;
                item.$iframe = $$2(ref);
              })
          }
        })
        .then(function () {
          if (isReload || !item.contentWindow || item.contentWindow.closed) {
            item.contentWindow = (item.$iframe[0] && item.$iframe[0].contentWindow) || null;
            if (!item.contentWindow || item.contentWindow.closed) {
              return sleep(500).then(function (_) { return this$1.dmw$iframeLoad(id, true); })
            }
          }
        })
    },
    dmw$mainWrapInit: function dmw$mainWrapInit (id) {
      var this$1 = this;

      var item;
      if (!(id && (item = this.process[id]))) {
        return Promise.resolve()
      }
      if (item.removeing || !item.isHasView) {
        return Promise.resolve()
      }
      return Promise.all((this.taskIds || []).map(function (taskId) {
        item.$mainWrap || this$1.$set(item, '$mainWrap', {});
        if (!item.$mainWrap[taskId]) {
          return findOrSleepCall(this$1.$refs, 'mc_' + taskId + '_p_' + id)
            .then(function (ref) {
              ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref;
              item.$mainWrap[taskId] = $$2(ref);
            })
        }
      }))
    },
    dmw$viewInit: function dmw$viewInit (id) {
      var this$1 = this;

      var item;
      if (!(id && (item = this.process[id]))) {
        return Promise.resolve()
      }
      if (item.removeing || !item.isHasView) {
        return Promise.resolve()
      }
      if (item.refinit) {
        return this.dmw$mainWrapInit(id)
      }
      return Promise.resolve()
        .then(function () {
          if (!item.$parent) {
            return findOrSleepCall(this$1.$refs, 'vp_' + id)
              .then(function (ref) {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref;
                item.$parent = $$2(ref);
              })
          }
        })
        .then(function () {
          if (!item.$content) {
            return findOrSleepCall(this$1.$refs, 'vb_' + id)
              .then(function (ref) {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref;
                item.$content = $$2(ref);
              })
          }
        })
        .then(function () { return this$1.dmw$mainWrapInit(id); })
        .then(function () {
          // 初始化完毕
          item.refinit = true;
          if (item.mode === 'iframe') {
            item.init = true;
            return this$1.dmw$iframeLoad(id)
          } else if (item.mode === 'component') {
            return this$1.loadComponent(id)
              .then(function () {
                item.init = true;
              })
              .catch(function (error) {
                item.error = error;
              })
          }
        })
        .then(function () {
          item.init = true;
        })
        .then(function () {
          // 移动窗口到
          return this$1.$ddvMultiWindow.windowAppendChild({
            id: id,
            taskId: item.taskId
          })
        })
    },
    dmw$taskInit: function dmw$taskInit (id) {
      var this$1 = this;

      var item;
      if (!(id && (item = this.process[id]))) {
        return
      }
      if (item.refinit || item.removeing || !item.isTask) {
        return
      }
      return Promise.resolve()
        .then(function () {
          if (!item.$taskParent) {
            return findOrSleepCall(this$1.$refs, 'tp_' + id)
              .then(function (ref) {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref;
                item.$taskParent = $$2(ref);
              })
          }
        })
        .then(function () {
          if (!item.$taskContent) {
            return findOrSleepCall(this$1.$refs, 'tb_' + id)
              .then(function (ref) {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref;
                item.$taskContent = $$2(ref);
              })
          }
        })
        .then(function () {
          if (!item.$mainParent) {
            return findOrSleepCall(this$1.$refs, 'mp_' + id)
              .then(function (ref) {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref;
                item.$mainParent = $$2(ref);
              })
          }
        })
        .then(function () {
          if (!item.$mainContent) {
            return findOrSleepCall(this$1.$refs, 'mb_' + id)
              .then(function (ref) {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref;
                item.$mainContent = $$2(ref);
              })
          }
        })
        .then(function () {
          // 初始化完毕
          item.refinit = true;
        })
    },
    dmw$processInit: function dmw$processInit () {
      var this$1 = this;

      var promises = [];
      this.pids.forEach(function (id) { return promises.push(); });
      return Promise.all(this.pids.map(function (id) {
        var item;
        if (!(id && (item = this$1.process[id]))) {
          return Promise.resolve()
        }
        if (item.isHasView) {
          return this$1.dmw$viewInit(id)
        }
        if (item.isTask) {
          return this$1.dmw$taskInit(id)
        }
        return Promise.resolve()
      }))
    },
    dmw$ddvMultiWindowMapInit: function dmw$ddvMultiWindowMapInit () {
      var this$1 = this;

      var item = this.$ddvMultiWindowGlobal.map[this.daemonId];
      return Promise.all(this.taskIds.map(function (taskId) {
        if (!item.api[taskId]) {
          item.api[taskId] = new DdvMultiWindow(item.app, taskId);
        }
      }).concat(Object.keys(item.api || {}).map(function (taskId) {
        this$1.taskIds.indexOf(taskId) > -1 || this$1.$delete(item.api, taskId);
      })))
    },
    dmw$handleContentWindowLoad: function dmw$handleContentWindowLoad () {
      return Promise.all([
        this.dmw$handleMasterWindowLoad(),
        this.dmw$handleIframeLoad()
      ])
    },
    dmw$handleMasterWindowLoad: function dmw$handleMasterWindowLoad () {
      var this$1 = this;

      return Promise.resolve(this.pids.map(function (pid) {
        if (!(pid && this$1.process)) {
          return Promise.resolve()
        }
        var process = this$1.process[pid];
        if (!(process && process.hasContentWindow)) {
          return Promise.resolve()
        }
        /* 缺少清理代码 */
        return Promise.resolve()
      }))
    },
    dmw$handleIframeLoad: function dmw$handleIframeLoad (event, id) {
      var this$1 = this;

      return this.tryRun(function (_) { return sleep(300).then(function (_) { return this$1.dmw$iframeLoad(id); }); })
    },
    dmw$handlePidsChange: function dmw$handlePidsChange () {
      var this$1 = this;

      // 下一进程进行 初始化窗口 加载
      return this.tryRun(function (_) { return Promise.all([
        // this.windowWrapRefsInit(),
        this$1.dmw$processInit()
      ]); })
    },
    dmw$handleTaskIdsChange: function dmw$handleTaskIdsChange () {
      var this$1 = this;

      // 下一进程进行 初始化窗口 加载
      return this.tryRun(function (_) { return this$1.dmw$ddvMultiWindowMapInit(); })
    },
    dmw$onbeforeunload: function dmw$onbeforeunload (event) {
      event.returnValue = '关闭会导致所有窗口都关闭，您确认关闭';
      return '关闭会导致所有窗口都关闭?'
    },
    dmw$handleCloseInit: function dmw$handleCloseInit () {
      var cw = this.$ddvMultiWindowGlobal.contentWindow;
      cw.addEventListener('close', this.closeAllMasterWindow.bind(this));
      cw.addEventListener('unload', this.closeAllMasterWindow.bind(this));
    }
  },
  watch: {
    taskIds: {
      handler: 'dmw$handleTaskIdsChange',
      deep: true
    },
    pids: {
      handler: 'dmw$handlePidsChange',
      deep: true
    }
  },
  mounted: function mounted () {
    this.dmw$handleCloseInit();
  }
}

var handleTask = {
  methods: {
    handleTask: function handleTask (event, type, id) {
      var this$1 = this;

      return this.$ddvMultiWindow.tryRun(function () {
        return this$1['handleTask$' + type](event, id)
      })
    },
    // 当标签被点击的时候
    handleTask$click: function handleTask$click (event, pid) {
      event.stopPropagation();
      // 注意禁止浏览器默认事件
      event.preventDefault();
      return this.$ddvMultiWindow.tabToWindow(pid)
    },
    // 刷新一个tab窗口
    handleTask$refresh: function handleTask$refresh (event, pid) {
      event.stopPropagation();
      // 注意禁止浏览器默认事件
      event.preventDefault();
      return this.$ddvMultiWindow.refresh(pid)
    },
    // 移除一个tab窗口
    handleTask$openMasterWindow: function handleTask$openMasterWindow (event, pid) {
      event.stopPropagation();
      // 注意禁止浏览器默认事件
      event.preventDefault();
      return this.$ddvMultiWindow.openMasterWindow(pid)
    },
    // 移除一个tab窗口
    handleTask$remove: function handleTask$remove (event, pid) {
      event.stopPropagation();
      // 注意禁止浏览器默认事件
      event.preventDefault();
      return this.$ddvMultiWindow.remove(pid)
    },
    // 移除所有tab窗口
    handleTask$removeAll: function handleTask$removeAll (event, taskId) {
      var this$1 = this;

      event.stopPropagation();
      // 注意禁止浏览器默认事件
      event.preventDefault();
      var closePromises = [];
      this.process[taskId].pids.forEach(
        function (pid) { return this$1.process[pid] && this$1.process[pid].closable !== false &&
          closePromises.push(this$1.$ddvMultiWindow.remove(pid)); }
      );
      return Promise.all(closePromises)
    },
    // 右键一个tab窗口
    handleTask$contextMenu: function handleTask$contextMenu (event, pid) {
      event.stopPropagation();
      // 注意禁止浏览器默认事件
      event.preventDefault();
      console.log('右键');
    }
  }
}

var apiHook = {
  methods: {
    // 打开前钩子事件
    onBeforeOpen: function onBeforeOpen (fn) {
      return registerHook(this.beforeOpenHooks, fn)
    },
    // 打开后钩子事件
    onOpened: function onOpened (fn) {
      return registerHook(this.openedHooks, fn)
    },
    // 移除前钩子事件
    onBeforeRemove: function onBeforeRemove (fn) {
      return registerHook(this.beforeRemoveHooks, fn)
    },
    // 更新前前钩子事件
    onBeforeRefres: function onBeforeRefres (fn) {
      return registerHook(this.beforeRefresHooks, fn)
    },
    // 更新后钩子事件
    onRefreshed: function onRefreshed (fn) {
      return registerHook(this.refreshedHooks, fn)
    },
    onReady: function onReady (cb, errorCb) {
      var this$1 = this;

      this.readyCbs.push(cb);
      errorCb && this.errorHooks.push(errorCb);
      return function () {
        var i = this$1.readyCbs.indexOf(cb);
        var ie = this$1.errorHooks.indexOf(errorCb);
        if (i > -1) { this$1.readyCbs.splice(i, 1); }
        if (ie > -1) { this$1.errorHooks.splice(ie, 1); }
      }
    },
    onError: function onError (errorCb) {
      return registerHook(this.errorHooks, errorCb)
    }
  },
  beforeCreate: function beforeCreate () {
    this.readyCbs = [];
    this.errorHooks = [];
    this.openedHooks = [];
    this.refreshedHooks = [];
    this.beforeOpenHooks = [];
    this.beforeRemoveHooks = [];
    this.beforeRefresHooks = [];
  }
}

function registerHook (list, fn) {
  list.push(fn);
  return function () {
    var i = list.indexOf(fn);
    if (i > -1) { list.splice(i, 1); }
  }
}

/*  */

var Daemon = {
  name: 'ddvMultiWindowDaemon',
  mixins: [
    base,
    api,
    apiTab,
    apiUtil,
    apiProps,
    apiAction,
    handle,
    handleTask,
    apiHook
  ],
  render: render
}

var Button = {
  name: 'ddvMultiWindowButton',
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    tag: {
      type: String,
      default: 'button'
    },
    daemonId: {
      type: [Number, String],
      default: 'daemon'
    },
    taskId: {
      type: [Number, String],
      default: 'daemon'
    },
    event: {
      type: [String, Array],
      default: 'click'
    }
  },
  data: function data () {
    return {
      ddvMultiWindowReady: false,
      error: null
    }
  },
  render: function render (h) {
    var this$1 = this;

    var on = { click: guardEvent };
    if (Array.isArray(this.event)) {
      this.event.forEach(function (e) { on[e] = this$1.handler.bind(this$1); });
    } else {
      on[this.event] = this.handler.bind(this);
    }

    return h(this.tag, { on: on }, this.$slots.default)
  },
  methods: {
    masterInit: function masterInit () {
      var this$1 = this;

      // master进程的id
      this.$ddvMultiWindowGlobal.masterInit(this)
        .then(function () {
          this$1.$ddvMultiWindow.onDaemonClose = this$1.onDaemonClose.bind(this$1);
          // 标记初始化完毕
          this$1.ddvMultiWindowReady = true;
        }, function (e) {
          console.error(e);
          this$1.error = e;
        });
    },
    handler: function handler (e) {
      var this$1 = this;

      if (guardEvent(e)) {
        var target = e.currentTarget.getAttribute('target');
        var taskId = target || this.taskId;
        var options = cloneRenderOptions(typeof this.to === 'string' ? { src: this.to } : clone(this.to), {
          taskId: taskId
        });
        if (this.ddvMultiWindowReady) {
          this.$ddvMultiWindow.open(options);
        } else {
          return this.$ddvMultiWindowGlobal.masterInit(this)
            .then(function () {
              this$1.$ddvMultiWindow.open(options);
            })
        }
      }
    }
  },
  created: function created () {
    this.$isServer || this.masterInit();
  }
}

function guardEvent (e) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) { return }
  // don't redirect when preventDefault called
  if (e.defaultPrevented) { return }
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) {
    e.preventDefault();
  }
  return true
}

var ErrorComponent$1 = {
  name: 'ddv-multi-window-error',
  props: {
    view: {
      type: String,
      default: 'view'
    },
    error: {}
  },
  render: function render (_c) {
    return _c('section', [_c('div', {}, [this.message])])
  },
  computed: {
    message: function message () {
      return this.error.message || '出错了'
    }
  }
}

var $$3 = require('jquery');
var master = {
  name: 'ddv-multi-window-master',
  props: {
    daemonId: {
      type: [Number, String],
      default: 'daemon'
    },
    view: {
      type: String,
      default: 'view'
    },
    autoColse: {
      type: Boolean,
      default: true
    }
  },
  data: function data () {
    return {
      ddvMultiWindowReady: false,
      refReady: false,
      error: null,
      init: false,
      wrap: null,
      $wrap: null
    }
  },
  render: function render (h) {
    var children = [];
    if (this.error) {
      children.push(h(ErrorComponent$1, {
        key: 'error',
        attrs: {
          'ddv-multi-window-type': 'errorBox'
        },
        props: {
          view: this.view,
          error: this.error
        }
      }));
    } else if (!this.init) {
      children.push(h(LoadComponent, {
        key: 'load'
      }));
    }
    return h('div', {
      key: 'master',
      ref: 'm',
      attrs: {
        id: 'dmw_master_' + this.view + this.id,
        'ddv-multi-window-type': 'master' + this.view
      }
    }, children)
  },
  methods: {
    masterInit: function masterInit () {
      var this$1 = this;

      // master进程的id
      this.$ddvMultiWindowGlobal.masterInit(this)
        .then(function () {
          this$1.$ddvMultiWindow.onDaemonClose = this$1.onDaemonClose.bind(this$1);
          // 标记初始化完毕
          this$1.ddvMultiWindowReady = true;
        }, function (e) {
          console.error(e);
          this$1.error = e;
        });
    },
    refReadyInit: function refReadyInit () {
      var this$1 = this;

      return Promise.resolve()
        .then(function () {
          if (!this$1.wrap) {
            return findOrSleepCall(this$1.$refs, 'm')
              .then(function (ref) {
                ref = Array.isArray(ref) ? ref[0] : (ref && ref[0]) || ref;
                this$1.wrap = ref;
                this$1.$wrap = $$3(this$1.wrap);
              })
          }
        }).then(function () {
          this$1.refReady = true;
        })
    },
    closeWindow: function closeWindow () {
      try {
        this.contentWindow.close();
      } catch (e) {
        try {
          window.close();
        } catch (e) { }
      }
    },
    closeMasterWindow: function closeMasterWindow () {
      try {
        this.$ddvMultiWindow.closeMasterWindow(this.taskId);
      } catch (e) {
        this.closeWindow();
      }
    },
    masterViewInit: function masterViewInit () {
      var this$1 = this;

      if (this.masterReady) {
        var cw = this.contentWindow;
        cw.addEventListener('close', this.closeMasterWindow.bind(this));
        cw.addEventListener('unload', this.closeMasterWindow.bind(this));
        this.$ddvMultiWindow.masterViewInit(this.view, this.taskId, this.$wrap)
          .then(function () {
            this$1.init = true;
          });
      }
    },
    onDaemonClose: function onDaemonClose () {
      var this$1 = this;

      this.$ddvMultiWindow.masterMoveParentByTaskId(this.taskId);
      this.error = new Error('主窗口被关闭');
      this.autoColse && setTimeout(function () {
        this$1.closeWindow();
      }, 1500);
    }
  },
  computed: {
    taskId: function taskId () {
      return this.ddvMultiWindowReady ? this.$ddvMultiWindow.taskId : null
    },
    contentWindow: function contentWindow () {
      return this.$ddvMultiWindowGlobal.contentWindow
    },
    masterReady: function masterReady () {
      return this.refReady && this.ddvMultiWindowReady
    }
  },
  watch: {
    masterReady: {
      handler: 'masterViewInit'
    }
  },
  created: function created () {
    this.$isServer || this.masterInit();
  },
  mounted: function mounted () {
    this.$isServer || this.refReadyInit();
  }
}

var MasterTask = {
  name: 'ddv-multi-window-task',
  functional: true,
  props: {
    daemonId: {
      type: [Number, String],
      default: 'daemon'
    }
  },
  render: function render (h, ref) {
    var data = ref.data;
    var children = ref.children;
    var props = ref.props;

    props.view = 'task';
    data.props = props;
    return h(master, data, children)
  }
}

var MasterView = {
  name: 'ddv-multi-window-view',
  functional: true,
  props: {
    daemonId: {
      type: [Number, String],
      default: 'daemon'
    }
  },
  render: function render (h, ref) {
    var data = ref.data;
    var children = ref.children;
    var props = ref.props;

    props.view = 'view';
    data.props = props;
    return h(master, data, children)
  }
}

var _Vue;
var DdvMultiWindowGlobal = function DdvMultiWindowGlobal () {
  this.Vue = null;
};
DdvMultiWindowGlobal.prototype.masterInit = function masterInit (app) {
    var this$1 = this;

  if (this.Vue.prototype.$isServer) {
    return
  }
  if (!this.installed) {
    throw getError('not installed. Make sure to call `Vue.use(DdvMultiWindow)`before creating root instance.')
  }
  if (!app) {
    throw getError('必须传入app实例')
  }
  var ddvMultiWindow = getParent(app);
  if (ddvMultiWindow) {
    return Promise.resolve(ddvMultiWindow)
  }
  var daemonId = app.daemonId;

  return this.get(daemonId)
    .then(function (ddvMultiWindow) {
      try {
        if (this$1.contentWindow && ddvMultiWindow) {
          this$1.contentWindow.name = ddvMultiWindow.taskId;
        }
      } catch (e) {}
      app._ddvMultiWindow = ddvMultiWindow;
      return ddvMultiWindow
    })
};
DdvMultiWindowGlobal.prototype.daemonInit = function daemonInit (app) {
  if (this.Vue.prototype.$isServer) {
    return
  }
  var daemonId = app.daemonId;
  if (!daemonId) {
    return throwError('not installed. Make sure to call `daemonInit(app)`before creating root instance.', 'DAEMON_NOT_INIT', false)
  }
  if (!this.map[daemonId]) {
    this.map[daemonId] = {
      app: app,
      api: {}
    };
  }
  var ddvMultiWindow = app._ddvMultiWindow = this.get(daemonId, 'daemon', 0);
  return ddvMultiWindow
};
DdvMultiWindowGlobal.prototype.get = function get (daemonId, taskId, tryNumMax, tryNum) {
  var isPromise = tryNumMax !== 0;
  if (!this.installed) {
    return throwError('not installed. Make sure to call `Vue.use(DdvMultiWindow)`before creating root instance.', 'MUST_VUE_USE_DDV_MULTI_WINDOW', isPromise)
  }
  var item = this.map[daemonId];
  // 获取获取该窗口
  if (!(item && item.app && item.api)) {
    return throwError('daemonId does not exist', 'DAEMONID_NOT_EXIST', isPromise)
  }
  if (taskId && item.api[taskId]) {
    return isPromise ? Promise.resolve(item.api[taskId]) : item.api[taskId]
  }
  if (taskId === 'daemon') {
    item.api.daemon = new DdvMultiWindow(item.app, taskId);
    return isPromise ? Promise.resolve(item.api.daemon) : item.api.daemon
  }
  taskId = item.api.daemon.getPidByWindow(this.contentWindow, tryNumMax, tryNum);
  if (isPromise) {
    return taskId.then(function (taskId) {
      if (taskId && !item.api[taskId]) {
        item.api[taskId] = new DdvMultiWindow(item.app, taskId);
      }
      return Promise.resolve(item.api[taskId])
    })
  } else {
    if (taskId && !item.api[taskId]) {
      item.api[taskId] = new DdvMultiWindow(item.app, taskId);
    }
    return item.api[taskId]
  }
};
DdvMultiWindowGlobal.prototype.install = function install (Vue, options) {
  if ((this.installing || this.installed) && this.Vue === Vue) { return }
  // 防止多次重复安装
  this.installing = true;
  // 保存当前安装的vue
  this.Vue = Vue;
  // 存储配置项
  this.options = options;
  // Vue安装
  this.VueInstall(Vue);
  if (Vue.prototype.$isServer) {
    // 防止多次重复安装
    this.installing = false;
    // 防止多次重复安装
    this.installed = true;
    // 服务端不进一步初始化
    return
  }
  // 初始化
  this.optionsInstall();
  // 初始化
  this.daemonWindowInstall();
  // 全局注册
  this.namespaceReg();
  // 存储初始化
  this.mapInstall();
  // 防止多次重复安装
  this.installing = false;
  // 防止多次重复安装
  this.installed = true;
};
DdvMultiWindowGlobal.prototype.mapInstall = function mapInstall () {
  if (this.map) {
    return
  }
  if (this.contentWindow === this.daemonWindow) {
    this.map = Object.create(null);
  } else if (this.daemonWindow && this.daemonWindow[this.namespace]) {
    this.map = this.daemonWindow[this.namespace].map || this.map;
  }
  if (!this.map) {
    throw getError('Initialization failed, check if the \'options.namespace\' is consistent with the daemon window')
  }
  // this.Vue.util.defineReactive(this.Vue.prototype, 'ddvMultiWindowGlobalMap', this.map)
};
DdvMultiWindowGlobal.prototype.daemonWindowInstall = function daemonWindowInstall () {
  if (!this.options.window) {
    // 如果传入窗口，试图自动获取
    this.options.window = typeof window === void 0 ? this.options.window : window;
  }
  // 获取窗口
  this.contentWindow = getWindow(this.options.window);
  this.daemonWindow = getDaemonWindow(this.contentWindow);
  this.isDaemon = this.contentWindow ? this.contentWindow === this.daemonWindow : true;
  try {
    if (this.contentWindow) {
      if (!this.contentWindow.$ddvUtil) {
        this.contentWindow.$ddvUtil = {};
      }
      this.contentWindow.$ddvUtil.$daemonWindow = this.daemonWindow;
    }
  } catch (e) {
    warn(false, '守护窗口保存失败');
  }
};
DdvMultiWindowGlobal.prototype.optionsInstall = function optionsInstall () {
  this.options = unDefDefaultByObj((this.options || {}), {
    // 命名空间
    namespace: '__DDV_MULTI_WINDOW__'
  });
};
DdvMultiWindowGlobal.prototype.namespaceReg = function namespaceReg (name) {
  name = name || this.options.namespace;
  if (!this.contentWindow[name]) {
    this.contentWindow[name] = this;
  }
};
DdvMultiWindowGlobal.prototype.VueInstall = function VueInstall (Vue) {
  Vue = Vue || this.Vue;
  // 钩子安装
  this.hookInstall(Vue);
  // 组件安装
  this.componentInstall(Vue);
  // 继承安装
  this.VuePrototypeInstall(Vue);
  // 接口安装
  this.RegisterInstanceInstall(Vue);
};
DdvMultiWindowGlobal.prototype.hookInstall = function hookInstall (Vue) {
  // 管理状态
  var strats = Vue.config.optionMergeStrategies;
  // 对窗口挂钩使用相同的钩子合并策略
  strats.beforeDdvMultiWindowOpen = strats.ddvMultiWindowOpened = strats.beforeDdvMultiWindowRemove = strats.ddvMultiWindowRemoved = strats.beforeDdvMultiWindowRefresh = strats.ddvMultiWindowRefreshed = strats.created;
};
DdvMultiWindowGlobal.prototype.componentInstall = function componentInstall (Vue) {
  // 安装组件
  Vue.component(Task.name, Task);
  Vue.component(Daemon.name, Daemon);
  Vue.component(Button.name, Button);
  Vue.component(master.name, master);
  Vue.component(MasterTask.name, MasterTask);
  Vue.component(MasterView.name, MasterView);
};
DdvMultiWindowGlobal.prototype.RegisterInstanceInstall = function RegisterInstanceInstall (Vue) {
  this.Vue.mixin({
    beforeCreate: function beforeCreate () {
      this._ddvMultiWindow = (this.$parent && this.$parent._ddvMultiWindow) || void 0;
      registerInstance(this, this);
    },
    destroyed: function destroyed () {
      registerInstance(this);
    }
  });
};
DdvMultiWindowGlobal.prototype.VuePrototypeInstall = function VuePrototypeInstall (Vue) {
    var this$1 = this;

  Vue.prototype.hasOwnProperty('$ddvMultiWindow') || Object.defineProperty(Vue.prototype, '$ddvMultiWindow', {
    get: function get () {
      if (this._ddvMultiWindow) {
        return this._ddvMultiWindow
      } else {
        throw getError('多窗口没有初始化')
      }
    }
  });
  Vue.prototype.hasOwnProperty('$ddvMultiWindowGlobal') || Object.defineProperty(Vue.prototype, '$ddvMultiWindowGlobal', {
    get: function () { return this$1; }
  });
};
DdvMultiWindowGlobal.prototype.hasOwnProperty('namespace') || Object.defineProperty(DdvMultiWindowGlobal.prototype, 'namespace', {
  get: function get () {
    return this.options && this.options.namespace
  },
  set: function set (value) {
    this.options = this.options || Object.create(null);
    return (this.options.namespace = value)
  }
});
var g = Object.assign((new DdvMultiWindowGlobal()), {
  isDaemon: true,
  Ready: Ready,
  version: '3.0.1'
});
globalInit(g);

if (inBrowser && window.Vue) {
  window.Vue.use(DdvMultiWindow);
}
function getParent (parent) {
  parent = parent || this;
  if (parent && parent._ddvMultiWindow) {
    return parent._ddvMultiWindow
  }
  if (parent && parent.$parent) {
    return getParent(parent.$parent)
  } else {
    return null
  }
}
function registerInstance (vm, callVal) {
  var i = vm.$options._parentVnode;
  if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerDdvMultiWindowInstance)) {
    i(vm, callVal);
  }
}

exports._Vue = _Vue;
exports.DdvMultiWindowGlobal = DdvMultiWindowGlobal;
exports.default = g;
exports.getParent = getParent;
exports.Ready = Ready;
exports.EventMessageWindow = EventMessageWindow;

Object.defineProperty(exports, '__esModule', { value: true });

})));
