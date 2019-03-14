const map = new Map()

function geturls (array) {
  array.forEach(element => {
    if (map.get(element)) { // 如果map 内没有这个链接 或者这个链接没有下载过  存储到map  中
      map.set(element, 0)
    }
  })
  const urlarr = []
  map.forEach((value, key, map) => { // 如果这个没有被下载过则添加到数组中
    if (!value) {
      urlarr.push(key)
    }
  })
  return urlarr // 返回链接的数组  没有被下载过的数组
}

function getfetchurl (array) { // 从数组中取出一个链接
  const urls = geturls(array)
  const url = urls.shift() // 取出一个
  map.set(url, 1) // 在map 中把这个url做一个下载过的标记
  return url // 返回这个url
}
module.exports = getfetchurl
