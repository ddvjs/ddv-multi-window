
'use strict'
// 获取一个错误
export { throwError, getError, getError as default }
function getError (message, name, errorId, stack) {
  if (this instanceof getError) {
    return getError(message, name, errorId)
  } else {
    var e = new Error(message || 'Unknown Error')
    e.name = name || errorId || e.name
    e.errorId = errorId || e.name
    if (stack) {
      e.stack = e.stack + '\n' + stack
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
