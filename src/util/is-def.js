export { isDef as default, isDef, unDefDefault, unDefDefaultByObj }

function isDef (v) {
  return typeof v !== 'undefined'
}

function unDefDefault (v, d) {
  return isDef(v) ? v : d
}

function unDefDefaultByObj (v, d) {
  Object.keys(d).forEach(key => {
    v[key] = unDefDefault(v[key], d[key])
  })
  return v
}
