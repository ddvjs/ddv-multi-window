export default function getDdvMultiWindowByParent (parent) {
  parent = parent || this
  if (parent && parent._ddvMultiWindow) {
    return parent._ddvMultiWindow
  }
  if (parent && parent.$parent) {
    return getDdvMultiWindowByParent(parent.$parent)
  } else {
    return null
  }
}
