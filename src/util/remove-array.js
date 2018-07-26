// 切除数组中的一些数据
export default function removeArray (array, fn) {
  var res = []
  array.forEach(function (item, index) {
    if (fn(item)) {
      res.push.apply(res, array.splice(index, 1))
    }
  })
  return res
}
