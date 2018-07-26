import clone from './clone'
import { unDefDefault } from './is-def'
export default function cloneRenderOptions (options, defaultOptions) {
  return getRenderOptions(clone(defaultOptions), clone(options))
}
export function getRenderOptions (o, d) {
  Object.keys(d || {}).forEach(key => {
    if (typeof o[key] === 'object') {
      o[key] = getRenderOptions(o[key], d[key])
    } else {
      o[key] = unDefDefault(o[key], d[key])
    }
  })
  return o
}
