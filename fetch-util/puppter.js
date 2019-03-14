const puppeteer = require('puppeteer')
/**
 *
 * @param {*传递brower对象} browser
 * @param {*需要抓取的url} url
 * @param {*需要设置的header} headerOpitions
 * @param {*需要拦截的请求}
 * @param {*自定义抓取的回调函数} callback
 */
const duotap = async function (browser, url, headerOpitions, callback) {
  // 后期添加参数 imageFlog  是否拦截图片
  return new Promise(async (resolve, reject) => {
    try {
      const page = await browser.newPage()
      await page.setRequestInterception(true)
      await page.on('request', request => {
        let overrides = {
          headers: headerOpitions
        }
        // 这就是请求的类型如果是图片类型或者css请求的话执行abort拦截操作 否则continue继续请求别的
        if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet') {
          request.abort()
        } else {
          request.continue(overrides)
        }
      })
      await page.goto(url)
      let doc = {}
      if (callback) {
        doc = await callback(page) // 传递page对象   // 动态抓取的属性只能在 page对象读取内部找到
      } else {
        const bodyHandle = await page.$('html')
        doc = await page.evaluate(html => html.innerHTML, bodyHandle)
        await bodyHandle.dispose
      }
      resolve(doc)
    } catch (e) {
      reject(e)
    }
  })
}
/**
 *
 * @param {用于请求的URL  地址} urls
 * @param {*请求头选项} headerOpitions
 * @param {*用于自定义选择器的选项并需要返回获取到的HTML 上下文} callback
 */
async function headerLess (urls, headerOpitions, callback) {
  // 后期加入 使用 如何检测到用户名密码或验证码则显示 浏览器
  let head = false
  // 检测到需要登录 则显示页面
  const pages = []
  // const ips = ''
  try {
    // 生成Page对象
    const browser = await puppeteer.launch({
      headless: head
      // args: ['--no-sandbox', `--proxy-server=socks5:${ips}`] //代理IP设置
    })
    browser.setMaxListeners(30000) // 设置过期关闭时间
    let promiseArray = [] // 并发 数组
    for (let i = 0; i < urls.length; i++) {
      promiseArray.push(duotap(browser, urls[i]))
    }
    // 成功和失败分离的promise 并发
    await Promise.all(promiseArray.map(p => p.catch(e => e))) // 找到错误 直接捕获并且返回到数组中
      .then(function (result) {
        // 并发请求  捕获成功的请求
        if (result instanceof Array) {
          for (let i = 0; i < result.length; i++) {
            let pageMsg = {}
            pageMsg[urls[i]] = result[i]
            pages.push(pageMsg)
          }
        } else {
          let pageMsg = {}
          pageMsg[urls] = result
          pages.push(pageMsg)
        }
      })
      .catch(e => {
        // 捕获失败的请求 失败的请求放到redist 的 url map  中后续重新处理
      })

    await browser.close() // 关闭浏览器
    return pages
  } catch (e) {
    throw new Error('puppteer on error' + e)
  }
}

module.exports = headerLess
