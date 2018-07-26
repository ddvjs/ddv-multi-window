export default {
  name: 'ddv-multi-window-error',
  props: {
    view: {
      type: String,
      default: 'view'
    },
    error: {}
  },
  render (_c) {
    return _c('section', [_c('div', {}, [this.message])])
  },
  computed: {
    message () {
      return this.error.message || '出错了'
    }
  }
}
