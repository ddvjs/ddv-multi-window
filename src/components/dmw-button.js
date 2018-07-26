import button from './button'
export default {
  name: 'dmw-button',
  functional: true,
  render (h, { data, children, props }) {
    data.props = props
    return h(button, data, children)
  }
}
