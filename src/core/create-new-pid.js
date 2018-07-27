// 创建最后总和
let createNewidSumLast = 0
// 创建最后时间
let createNewidTimeLast = 0
/**
 * 创建一个当前运行环境中唯一的id
 * @param    {Boolean}                 is10 [是否为10进制]
 * @return   {String}                       [返回唯一id]
 */
export {
  time,
  createNewPid,
  createNewPid as default
}
function createNewPid (is10) {
  var r
  if (createNewidTimeLast !== time()) {
    createNewidTimeLast = time()
    createNewidSumLast = 0
  }
  r = createNewidTimeLast.toString() + (++createNewidSumLast).toString()
  // 使用36进制
  if (!is10) {
    r = parseInt(r, 10).toString(36)
  }
  return r
}

function time () {
  return parseInt(((new Date()).getTime()) / 1000)
}
