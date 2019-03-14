// 爬取具体的网页结构
const axios = require('axios')
const $ = require('cheerio')
const iconv = require('iconv-lite')
const fs = require('fs')
const ThunderEncode = require('./base64-thunder-transform')
const headers = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'zh-CN,zh;q=0.9',
  'Content-Type': 'application/json; charset=UTF-8',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive',
  'Referer': 'http: //www.ygdy8.net/html/gndy/dyzz/index.html',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
}
const opitions = {
  responseType: 'arraybuffer',
  headers: headers,
  baseURL: 'https://www.dytt8.net/html/'
}
const $get = async function (url, op) {
  return await axios.get(url, op)
}
axios.interceptors.response.use(function (response) {
  const ctype = response.headers
  const contentLength = response.headers['content-length'] // 要读取的页面大小
  const lastModified = response.headers['last-modified'] // 最后一次编辑的此页面时间
  const connection = response.headers['connection'] // keep-alive//下载的时候页面是否保持连接
  const date = response.headers['date'] // 下载的时间

  // console.log(`${response.data}`)
  return response
})
const url = 'gndy/dyzz/20190121/58098.html';
(async () => {
  const response = await $get(url, opitions)
  if (!response) {
    console.log(`空`)
    return
  }
  const parentDiv = $(response.data).find('.bd3r>.co_area2')
  const title = $(parentDiv).find('.title_all>h1>font').text() // 标题
  const contentDiv = $(parentDiv).find('#Zoom>span>p')
  const pictrueAddress = contentDiv.find('img').attr('src') // 图片地址
  const content = contentDiv.text() // 内容描述
  const thunderMargnet = contentDiv.find('a').attr('href') // 迅雷磁力链接
  const downAdderss = parentDiv.find('#Zoom>span>table>tbody>tr>td>a').attr('href')
  const aaa = await ThunderEncode(downAdderss) // 转换到迅雷下载链接

  console.log(aaa.toString('utf8'))
  console.log(thunderMargnet)
})()
  .then(r => {
    // console.log(r)
  })
  .catch(e => {
    console.log('e :', e)
  })
