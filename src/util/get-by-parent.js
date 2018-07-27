export default function getByParent (parent, key) {
  parent = parent || this
  if (parent && parent[key]) {
    return parent[key]
  }
  if (parent && parent.$parent) {
    return getByParent(parent.$parent, key)
  } else {
    return null
  }
}
