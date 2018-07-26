import sleep from './sleep'
export default function findOrSleepCall (obj, refName, tryNumMax, tryNum) {
  tryNumMax = tryNumMax || 50
  if (tryNum > tryNumMax) {
    console.error(obj, refName)
    return Promise.reject(new Error('查找失败'))
  } else {
    tryNum = (tryNum || 0) + 1
  }
  if (obj[refName]) {
    return Promise.resolve(obj[refName])
  }
  return sleep(60).then(_ => findOrSleepCall(obj, refName, tryNumMax, tryNum))
}
