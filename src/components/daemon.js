/* @flow */
import render from '../core/daemon/render'
import base from '../core/daemon/base'
import api from '../core/daemon/api'
import apiUtil from '../core/daemon/api.util'
import apiProps from '../core/daemon/api.props'
import apiTab from '../core/daemon/api.tab'
import apiAction from '../core/daemon/api.action'
import handle from '../core/daemon/handle'
import handleTask from '../core/daemon/handle.task'
import apiHook from '../core/daemon/api.hook'
import tabRouter from '../core/daemon/tab.router'

export default {
  name: 'ddv-multi-window-daemon',
  mixins: [
    base,
    api,
    apiTab,
    apiUtil,
    apiProps,
    apiAction,
    handle,
    handleTask,
    apiHook,
    tabRouter
  ],
  render
}
