
import getError from './get-error'

export function getDaemonWindow (w) {
  w = getWindow(w)
  var host, daemonWindow
  try {
    host = w.location.host
  } catch (e) { }
  if (!daemonWindow || daemonWindow === w) {
    try {
      // 试图获取浏览器顶层的
      if (w.parent && w.parent.location && host === w.parent.location.host) {
        try {
          // 试图获取浏览器顶层的
          if (w.parent.$ddvUtil && w.parent.$ddvUtil.$daemonWindow && w.parent.$ddvUtil.$daemonWindow.location && host === w.parent.$ddvUtil.$daemonWindow.location.host) {
            daemonWindow = w.parent.$ddvUtil.$daemonWindow
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
            daemonWindow = w.top.$ddvUtil.$daemonWindow
          }
        } catch (e) {
        }
        if (!daemonWindow) {
          daemonWindow = w.top
          try {
            // 试图获取浏览器顶层的
            if (w.top.opener && w.top.opener.location && host === w.top.opener.location.host) {
              daemonWindow = w.top.opener
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
        daemonWindow = w.parent
        try {
          // 试图获取浏览器顶层的
          if (w.parent.opener && w.parent.opener.location && host === w.parent.opener.location.host) {
            daemonWindow = w.parent.opener
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
            daemonWindow = w.opener.$ddvUtil.$daemonWindow
          }
        } catch (e) {
        }
        if (!daemonWindow) {
          daemonWindow = w.opener
          try {
            // 试图获取浏览器顶层的
            if (w.opener.opener && w.opener.opener.location && host === w.opener.opener.location.host) {
              daemonWindow = w.opener.opener
            }
          } catch (e) {
          }
        }
      }
    } catch (e) {
    }
  }
  if (daemonWindow && daemonWindow !== w) {
    daemonWindow = getDaemonWindow(daemonWindow)
  }
  if (!daemonWindow) {
    daemonWindow = w
  }
  return daemonWindow
}
export function getWindow (win) {
  if (win) {
    contentWindow = win
  }
  if (!win && typeof window !== typeof void 0) {
    contentWindow = window
  }
  if (!contentWindow) {
    throw getError('没有找到窗口')
  }
  return contentWindow
}
export function openWindow (url, options, win) {
  var contentWindow
  if (!win) {
    if (typeof window !== 'undefined' && window.window === window) {
      win = window
    } else {
      throw getError('window must input', 'WINDOW_MUST_INPUT')
    }
  }
  try {
    contentWindow = win.open(url, options.name || '', stringify(configure(options, win)))
  } catch (e) {
  }
  if (contentWindow) {
    return contentWindow
  }
  throw getError('open window fail', 'OPEN_WINDOW_FAIL')
}
export function stringify (obj) {
  const parts = []
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      parts.push(key + '=' + obj[key])
    }
  }
  return parts.join(',')
}

export function configure (options, win) {
  options = options || {}
  options.width = options.width || 640
  options.height = options.height || 480
  options.left = options.left || win.screenX + ((win.outerWidth - options.width) / 2)
  options.top = options.top || win.screenY + ((win.outerHeight - options.height) / 2.5)
  return options
}

export let contentWindow
export default getWindow
