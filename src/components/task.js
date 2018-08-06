import HorizontalTask from './taskComponents/horizontal-task.vue'
import VerticalTask from './taskComponents/vertical-task.vue'

export default {
  name: 'ddv-multi-window-task-template',
  functional: true,
  render (h, { props }) {
    if (props.taskOptions.mode === 'vertical') {
      return h(VerticalTask, {
        props
      })
    }
    return h(HorizontalTask, {
      props
    })
  }
}
