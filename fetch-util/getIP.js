// var Models = require('../lib/core')
// var $Ip = Models.$Ip
var request = require('superagent')
var cheerio = require('cheerio')
require('superagent-proxy')(request);
(async function () {
  // 请求代理IP页面
  var res = await request.get('https://free-proxy-list.net/')

  var $ = cheerio.load(res.text)
  var tr = $('tr')
  // 从第二行开始获取IP和端口
  for (var line = 1; line < tr.length; line++) {
    var td = $(tr[line]).children('td')
    var proxy = 'http://' + td[0].children[0].data + ':' + td[1].children[0].data
    // console.log(proxy, 'proxy')
    try {
      // 代理IP请求，设置超时为3000ms，返回正确即当可用
      var testip = await request.get('https://www.google.com').proxy(proxy).timeout(10)
      if (testip.statusCode === 200 && testip.text.substring(0, 4) === '{ip:') {
        // 存入数据库
        console.log(testip, 'ip')
        // await $Ip.addIp({
        //   proxy: proxy
        // })
      }
    } catch (error) {}
  }
})()
