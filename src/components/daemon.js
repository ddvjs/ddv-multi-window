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

export default {
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
  render
}
