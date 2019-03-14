const fs = require('fs')
/**
 *异步读取文件的方法  返回一个promise
 * @param {路径} path
 * @param {*设置的选项} opt
 */
const readFileAsync = (path, opt = 'utf8') => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, opt, function (err, doc) {
      if (err) reject(err)
      else resolve(doc)
    })
  })
}
/**
 * 异步写出文件的方法 返回一个promise
 * @param {路径} path
 * @param {*数据} data
 * @param {*设置的选项} opt
 */
const writeFileAsync = (path, data, opt = 'utf8') => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, opt, function (err, doc) {
      if (err) reject(err)
      else resolve(doc)
    })
  })
}
module.exports = {
  readFileAsync,
  writeFileAsync
}
