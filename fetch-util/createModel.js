const mongoose = require('mongoose')
const fs = require('../utils/fs')

/**
 *
 * @param {*mongooDB  连接需要的属性 用户名密码 和 连接地址和端口} mongooseConnect
 * @param {*网站名称} stationName
 * @param {*页面的抓取规则} pageFetchRules
 */
async function readConfigfiles (mongooseConnect, stationName, pageFetchRules, timesplate) {
  if (!stationName || stationName === '' || !pageFetchRules) {
    throw new Error('没有配置站点名称或者站点规则，生成站点存储模型失败')
  }
  // 根据站点名称创建一个库  库名成为站点名称的去点变小写
  const stationModelName = tolowerParseTheStationName(stationName)
  // 创建对应的数据库 并且连接
  const createDatabaseFlog = createDatabase(mongooseConnect, stationModelName)
  if (!createDatabaseFlog) { // 判断数据库是否连接成功
    throw new Error('站点的数据库连接不正确')
  }
  // 根据站点抓取规则 创建表 表结构为站点的 抓取规则
  const schemaObj = createFetchSchemaObject(pageFetchRules)
  // 生成表结构文件并写出
  const timestamp = Date.now().valueOf() // 现在  后续需要进行数据分表 根据时间
  const fetchModel = createFetchModel(schemaObj, createDatabaseFlog, timestamp)
  // 分表操作按照抓取时间来操作，表明为抓取时间，按照每 2小时为一个时间点
  return fetchModel
}
/**
 *把站点名称转换为数据的标准表的名字
 * @param {*站点名称} name
 */
function tolowerParseTheStationName (name) {
  name = name.toLowerCase().replace(/\./g, '').trim()
  return `db_${name}`
}
/**
 * 创建数据库并且连接
 * @param {数据的连接需要的参数} mongooseConnect
 * @param {*数据库的名字} name
 */
function createDatabase (mongooseConnect, name) {
  const local = mongooseConnect.url
  const username = mongoose.username
  const password = mongoose.password
  const options = mongoose.options
  let auth = ''
  if (username && password) {
    auth = `${username}:${password}@`
  }

  const db = mongoose.createConnection(`mongodb://${auth}${local}/${name}`, options) // 创建一个数据库连接
  console.log(`mongodb://${auth}${local}/${name}`)
  db.on('connected', function (err) {
    if (err) {
      console.log('连接数据库失败：' + err) // 日志输出
      return false
    } else {
      console.log('连接数据库成功！') // 日志输出
    }
  })
  db.once('open', function () {
    console.log('数据库使用中') // 日志输出
  })
  return db
}
/**
 * 根据抓取的规则来生成一个用来生成表格的schema对象
 * @param {抓取规则} fetchRules
 */
function createFetchSchemaObject (fetchRules) {
  let schemaObj = {}
  for (let i = 0; i < fetchRules.length; i++) {
    const element = fetchRules[i]
    for (let key in element) {
      schemaObj[key] = 'Array'
    }
  }
  console.log(schemaObj)
}
/**
 * 创建一个抓取存储Model
 * @param {*抓取模型} schemaObj
 * @param {*DB  对象} db
 * @param {*数据库名称} timestamp
 */
function createFetchModel (schemaObj, db, timestamp) {
  const Schema = mongoose.Schema
  const FetchSchema = new Schema(schemaObj)
  const FetchTimeAP = 'Fetch' + timestamp
  const FetchModel = db.model(FetchTimeAP, FetchSchema)
  console.log(FetchModel)
  return FetchModel
}
/**
 * 存储fetch到数据的方法
 * @param {*} fetchModel
 * @param {*}fetchData
 */

async function addFetchData (fetchModel, fetchData) {
  const successFlog = await fetchModel.insertMany(fetchData)
  if (!successFlog) {
    return false
  }
  return true
}
/**
 * 获取fetch数据的方法
 * @param {} fetchModel
 */
async function getFetchData (fetchModel, queryRules, limit, sort, select, callback) {
  if (!fetchModel || !queryRules) {
    throw new Error('没有传入  fetch  模型或者没有传入  数据')
  }
  let data = await fetchModel.find(queryRules)
  if (limit) data = await data.limit(limit)
  if (sort) data = await data.sort(sort)
  if (select) data = await data.select(select)
  if (callback) data = await data.exec(callback)
  return data
}
/**
 * 删除fetch  数据的方法
 * @param {*} fetchModel
 */
function deleteFetchData (fetchModel, deleteRules) {}
/**
 * 更新 fetch  数据的方法
 * @param {*} fetchModel
 */
function updateFetchData (fetchModel, updateRules) {}
/**
 * 输出产生 增删改查的方法
 * @param {*数据库连接的属性} mongooseConnect
 * @param {*要抓取的站点名称} stationName
 * @param {*要专区的页面的规则} pageFetchRules
 * @param {*存数据的更换表的时间间隔} timesplate
 */
function createFetchModelMothed () {
  return {
    readConfigfiles,
    addFetchData,
    getFetchData,
    deleteFetchData,
    updateFetchData
  }
}
module.exports = createFetchModelMothed
// const mongooseConnect = {
//   url: 'localhost:27017',
//   options: {
//     db: {
//       'useNewUrlParser': true
//     }

//   }
// }
// const stationName = 'www.dytt8.com'
// const pageFetchRules = [{
//   'title': {
//     'selector': "head > meta[name='keywords']",
//     'attr': {
//       'attr': 'content'
//     }
//   }
// }, {
//   '电影名称': {
//     'selector': '#header > div > div.bd2 > div.bd3 > div.bd3r > div.co_area2 > div.title_all > h1 > font',
//     'attr': {
//       'text': 'text'
//     }
//   }
// },
// {
//   '电影图片': {
//     'selector': '#Zoom > span > p:nth-child(1) > img:nth-child(4)',
//     'attr': {
//       'attr': 'src'
//     }
//   }
// },
// {
//   '磁力链接': {
//     'selector': '#Zoom > span > p:nth-child(1) > a',
//     'attr': {
//       'attr': 'href'
//     }
//   }
// },
// {
//   '迅雷下载链接': {
//     'selector': '#Zoom > span > table > tbody > tr > td > a',
//     'attr': {
//       'rex-value': '/^thunder:/'
//     }
//   }
// }
// ]
// readConfigfiles(mongooseConnect, stationName, pageFetchRules)
