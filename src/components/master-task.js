import master from './master'
export default {
  name: 'ddv-multi-window-task',
  functional: true,
  props: {
    daemonId: {
      type: [Number, String],
      default: 'daemon'
    },
    autoColse: {
      type: Boolean,
      default: true
    }
  },
  render (h, { data, children, props }) {
    props.view = 'task'
    data.props = props
    return h(master, data, children)
  }
}
