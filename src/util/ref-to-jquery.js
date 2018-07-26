const $ = require('jquery')
import { isDef } from './is-def'
export default function refToJquery (selector, refs) {
  if (!isDef(refs) && isDef(selector)) {
    refs = selector
    selector = void 0
  }
  const $refs = $(refs)
  return selector ? $refs.closest(selector) : $refs
}
