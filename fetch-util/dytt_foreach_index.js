const axios = require('axios')
const $ = require('cheerio')
const iconv = require('iconv-lite')
const headless = require('./puppter')
/**
 * 需要自定义的变量开始
 */
const PAGE_NUMBER = 10
const OPTIONS = {
  'head > title': 'textContent'
}
const FETCH_TYPE = 'damic'
const headers = {
  Host: 'www.dytt8.net',
  Connection: 'keep-alive',
  'Cache-Control': 'max-age = 0',
  'User-Agent': 'Mozilla / 5.0(Windows NT 10.0; Win64; x64) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 69.0 .3497 .100 Safari / 537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  Referer: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate',
  'If-None-Match': '047384b8e76d41:31b',
  'If-Modified-Since': 'Wed, 07 Nov 2018 11: 37: 42 GMT '
}
// {
//   'alt-svc': " quic='googleads.g.doubleclick.net:443'; ma=2592000; v='44,43,39',quic='':443'; ma=2592000; v='44,43,39'",
//   'cache-control': ' no-cache, must-revalidate',
//   'content-length': ' 0',
//   'content-type': ' text/html; charset=UTF-8',
//   'date': ' Mon, 25 Feb 2019 21:46:55 GMT',
//   'expires': ' Fri, 01 Jan 1990 00:00:00 GMT',
//   'p3p': " policyref='https://googleads.g.doubleclick.net/pagead/gcn_p3p_.xml', CP='CURa ADMa DEVa TAIo PSAo PSDo OUR IND UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR'",
//   'pragma': ' no-cache',
//   'server': ' cafe',
//   'status': ' 200',
//   'timing-allow-origin': ' *',
//   'x-content-type-options': ' nosniff',
//   'x-xss-protection': ' 1; mode=block'
// }

/**
 * 需要自定义的变量结束
 */
// 更改格式
axios.interceptors.response.use(function (response) {
  response.data = iconv.decode(response.data, 'gbk')
  return response
})
class Station {
  /**
   *爬取的构造器
   * @param {*要抓取网站的基础url：required} baseurl
   * @param {*要抓去的内容页面的链接集合} fetchUrls
   * @param {*抓取过程中的请求头} headers
   * @param {*抓取页面元素和对应的规则：required} fetchRules
   * @param {*网站的用户名} username
   * @param {*网站的密码} password
   */
  constructor(options) {
    if (!options) {
      throw new Error('没有配置选项')
    }
    if (!options.siteurl) {
      throw new Error('没有配置选项')
    }
    if (!options.fetchRules) {
      throw new Error('没有配置选项')
    }
    this.siteurl = options.siteurl /// / 网站的主域名
    this.baseurl = options.baseurl // 要抓取的页面
    this.headers = options.headers || null // 网站获取的头部  是一个json 字符串
    this.fetchRules = options.fetchRules // 需要获取的页面元素对应的获取方法
    this.username = options.username || null // 用户名
    this.password = options.password || null // 密码
    this.fetchUrls = options.fetchUrls || null // 需要获取的页面
  }
  /**
   *
   * @param {需要访问的url相对于baseurl的地址} url
   */
  _$get(url) {
    const baseHeader = {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'max-age=0',
      Connection: 'keep-alive',
      Host: url || this.siteurl,
      Referer: this.siteurl,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
    }
    const opitions = {
      responseType: 'arraybuffer',
      headers: this.headers || baseHeader,
      baseURL: this.siteurl
    }
    return new Promise((resolve, reject) => {
      axios
        .get(url, opitions)
        .then(r => {
          resolve(r)
        })
        .catch(e => {
          reject(e)
        })
    })
  }

  toString() {
    return `baseurl:${this.baseurl} ,
              headers:${this.headers}
              fetchRules:${this.fetchRules}
              username : ${this.username}
             password : ${this.password}
             fetchUrls : ${this.fetchUrls}.`
  }
  /**
   *静态获取页面的方法
   * @param {需要抓取的页面数组} urls
   * @returns {抓取的静态页面的数组} resps
   */
  async fetchPage(urls) {
    if (urls.length < 1) {
      throw new Error('urls 不够')
    } else {
      const resps = []
      for await (const url of urls) {
        const r = await this._$get(url)
        if (r.data && r) {
          resps.push(r.data)
        }
      }

      if (!resps || resps.length < 1) {
        throw new Error('没有找到返回资源')
      }
      return resps
    }
  }
  /**
   * 动态抓取 使用headless
   * @param {需要抓取的全部地址} urls
   * @returns {resps} 抓取到的页面信息
   */
  async fetchPageDynamic(urls) {
    if (urls.length < 1) {
      throw new Error('urls 不够')
    } else {
      const resps = await headless(urls)

      if (!resps || resps.length < 1) {
        throw new Error('没有找到返回资源')
      }
      return resps
    }
  }

  /**
   * 通过页面信息抓取A链接
   * @param {需要抓取的页面URL数组} urls
   */
  async fetchAllLinks(pageMsgs, urls) {
    if (urls instanceof Array) {
      if (urls.length < 1) {
        throw new Error('没有需要抓取的链接')
      }
    } else if (typeof urls === 'string') {
      urls = [urls]
    } else if (urls instanceof Object) {
      if (urls.link) {
        urls = [urls.link]
      } else {
        throw new Error('没有需要抓取的链接')
      }
    } else {
      throw new Error('没有需要抓取的链接')
    }

    const allLinks = new Set()
    pageMsgs.forEach(pageMsg => {
      const pageLinks = $(pageMsg).find('a')
      for (let i = 0; i < pageLinks.length; i++) {
        allLinks.add(pageLinks[i])
      }
    })
    return Array.from(allLinks)
  }

  /**
   *
   * @param {放有页面链接的集合} list
   * @return {页面链接的href的数组} array
   */
  getlinksHref(list) {
    const urls = []
    for (let key in list) {
      if (list.hasOwnProperty(key) && Number.parseInt(key)) {
        const element = list[key]
        if (typeof element === 'object') {
          if (
            !element ||
            !element.attribs ||
            !element.children ||
            !element.children[0] ||
            !element.children[0]['type'] ||
            !element.children[0]['data'] ||
            !element.attribs.href ||
            element.attribs.href === '' ||
            element.children[0]['type'] !== 'text'
          ) {
            continue
          } else {
            const attribs = element.attribs
            if (attribs.href.slice(0, 1) === '/') {
              urls.push(this.siteurl + attribs.href)
            } else {
              if (attribs.href.indexOf(this.siteurl) === -1) {
                continue
              } else {
                urls.push(attribs.href)
              }
            }
          }
        }
      }
    }
    return urls
  }
  /**
   *打印对象
   * @param {*} obj
   */
  ShowTheObject(obj) {
    var des = ''
    for (var name in obj) {
      des += name + ':' + obj[name] + ';'
    }
    console.log(des)
  }

  /**
   *
   * @param {需要过滤信息的page数组} pages
   * @ return {包含过滤之后的信息的数组} array
   */
  filterYouNeed(pages, pageRules) {
    const pageMsgs = []
    const pageLinks = []
    if (pageRules instanceof Array) {
      pages.forEach((page, pageIndex) => {
        const attrArray = []
        console.log(pages instanceof + 'aaaaaaaaaaaa' + page instanceof + '=======================page')
        pageRules.forEach((rule, ruleIndex) => {
          for (const key in rule) {
            if (rule.hasOwnProperty(key)) {
              const ruleName = key
              const ruleSelector = rule[key]['selector'] // 获取的选择器
              const ruleAttr = rule[key]['attr'] // 获取元素的属性
              console.log(ruleName + '===========' + ruleSelector + '==============' + ruleAttr)
              const pageSelectMsg = $(page).find(ruleSelector)
              for (const attrKey in ruleAttr) {
                if (ruleAttr.hasOwnProperty(attrKey)) {
                  const ruleElement = ruleAttr[attrKey]
                  let fetchvalue
                  switch (attrKey) {
                    case 'attr':
                      console.log(pageSelectMsg + '===============(pageSelectMsg.attribs,')
                      fetchvalue = pageSelectMsg.attribs[ruleElement]
                      break
                    case 'text':
                      fetchvalue = pageSelectMsg.text()
                      break
                    case 'html':
                      fetchvalue = pageSelectMsg.html()
                      break
                    case 'rex-key':
                      console.log(pageSelectMsg.attribs, '============================pageSelectMsg.attribs')
                      break
                    case 'rex-value':
                      console.log(pageSelectMsg.attribs, '============================pageSelectMsg.attribs')
                      break
                  }
                  let selectorMsg
                  console.log(fetchvalue)
                  selectorMsg[ruleName] = fetchvalue
                  attrArray.push(selectorMsg)
                }
              }
            }
          }
        })
        let pageMsg
        pageMsg[page.url] = pageMsgs
        pageMsgs.push(pageMsg)
      })
      console.log(pageMsgs)
      return pageMsgs
    } else {
      throw new Error('pageRoles illegal')
    }
  }
  /**
   *
   * @param {站点url} siteurl
   * @param {*要获取的目标页面} fetchUrl
   * @param {*请求头} headers
   * @param {*set数据结构} set
   * @param {*返回创建的对象可继续调用}
   */
  static getStation(siteurl, headers) {
    return new Station({
      siteurl: siteurl,
      fetchRules: {
        a: 'abc'
      },
      headers: headers
    })
  }
  async init() {
    const station = this.getStation()
    const firstPage = this.FETCH_TYPE === 'static' ? await this.fetchPage(this.) : await this.fetchPageDynamic(urls)
  }
}

function geturls(array, map) {
  array.forEach((element, index) => {
    if (!map.get(element)) {
      // 如果map 内没有这个链接 或者这个链接没有下载过  存储到map  中
      map.set(element, 0)
    }
  })
  const urlarr = []
  map.forEach((value, key, map) => {
    // 如果这个没有被下载过则添加到数组中
    if (!value) {
      urlarr.push(key)
    }
  })
  return urlarr // 返回链接的数组  没有被下载过的
}

function getfetchurl(array, map) {
  // 从数组中取出一些链接
  const urls = geturls(array, map)
  const fetchUrls = []
  for (let i = 0; i < PAGE_NUMBER; i++) {
    // 循环取出
    const url = urls.shift() // 取出一个
    map.set(url, 1) // 在map 中把这个url做一个下载过的标记
    fetchUrls.push(url)
  }

  return fetchUrls // 返回这个url
}

const dyttStation = Station.getStation('https://dytt8.net/', headers);
(async () => {
  const urlmap = new Map()
  const pageMsgs = FETCH_TYPE === 'static' ? await this.fetchPage(urls) : await this.fetchPageDynamic(urls)
  const response = await dyttStation.fetchAllLinks('https://dytt8.net/')
  const hrefs = dyttStation.getlinksHref(response)
  const fetchURLs = getfetchurl(hrefs, urlmap)

  async function fetch(link) {
    const pagerules = [{
        title: {
          selector: "head > meta[name='keywords']",
          attr: {
            attr: 'content'
          }
        }
      },
      {
        电影名称: {
          selector: '#header > div > div.bd2 > div.bd3 > div.bd3r > div.co_area2 > div.title_all > h1 > font',
          attr: {
            text: 'text'
          }
        }
      },
      {
        电影图片: {
          selector: '#Zoom > span > p:nth-child(1) > img:nth-child(4)',
          attr: {
            attr: 'src'
          }
        }
      },
      {
        磁力链接: {
          selector: '#Zoom > span > p:nth-child(1) > a',
          attr: {
            attr: 'href'
          }
        }
      },
      {
        迅雷下载链接: {
          selector: '#Zoom > span > table > tbody > tr > td > a',
          attr: {
            'rex-value': '/^thunder:/'
          }
        }
      }
    ]
    const response = await dyttStation.fetchAllLinks(link) // 获取fetch初始链接链接

    const pages = await dyttStation.fetchPageDynamic(response) // fetch页面信息
    const msgs = dyttStation.filterYouNeed(pages, pagerules) // 过滤页面信息
    const urls = dyttStation.fetchAllLinks(response)
    const url = getfetchurl(urls, urlmap)
    if (urls.length !== 0) {
      fetch(url)
    }
  }

  await fetch(fetchURLs)
})()
