const fs = require('../utils/fs')
const axios = require('axios')
const $ = require('cheerio')
const iconv = require('iconv-lite')
const headless = require('./puppter')
const createModel = require('./createModel')
const fetchModel = createModel()
axios.interceptors.response.use(function (response) {
  response.data = iconv.decode(response.data, 'gbk')
  return response
})
class Station {
  /**
   *
   * @param {*站点的url} stationURL
   * @param {* 站点名称} stationName
   * @param {* 是否使用自由头组合 默认为 使用 true} headerFlog
   * @param {* 不使用自由头组合则传入一个请求头数组} headers
   * @param {* 抓取方式 static  静态  dynamic 动态抓取} fetchType
   * @param {*是否抓取全站 默认为false 开启全站抓取} fetchAllFlog
   * @param {*开始抓取的起点} firstPage
   * @param {*抓取的页面的解码方式} pageEncodeType
   * @param {*mongoodb的连接方式} mongooDBContect
   * @param {*redis的连接方式} redisConnect
   * @param {*最大的并发数} maxConnectNumber
   * @param {*同时访问的页面数} maxPageNumber
   * @param {*页面的抓取规则} pageRules
   * @param {*用户名} userName
   * @param {*密码} password
   * @param {*是否使用代理} proxyFlog
   * @param {*使用代理的IP池} proxyIPS
   */
  constructor (
    stationURL,
    stationName,
    headerFlog,
    headers,
    fetchType,
    fetchAllFlog,
    firstPage,
    pageEncodeType,
    mongooDBContect,
    redisConnect,
    maxConnectNumber,
    maxPageNumber,
    pageRules,
    userName,
    password,
    proxyFlog,
    proxyIPS
  ) {
    this.STATION_URL = stationURL
    this.STATION_NAME = stationName
    this.STATION_HEADER_AUTO_CHANGE_FLOG = headerFlog || true
    this.STATION_HEADERS = headers
    this.STATION_FETCH_TYPE = fetchType
    this.FETCH_ALL_FLOG = fetchAllFlog || true
    this.FETCH_FIRST_PAGE = firstPage
    this.FETCH_PAGE_ENCODE_TYPE = pageEncodeType
    this.MONGOODB_CONNECT = mongooDBContect
    this.REDIS_CONNECT = redisConnect
    this.MAX_CONNECT_NUMBER = maxConnectNumber
    this.MAX_PAGE_NUMBER = maxPageNumber
    this.FETCH_PAGE_RULES = pageRules
    this.STATION_USERNAME = userName
    this.STATION_PASSWORD = password
    this.STATION_USER_PROXY_FLOG = proxyFlog
    this.STATION_PROXY_IPS = proxyIPS
    this.stationMsg = []
    this.stationLinkMap = new Map()
  }
  /**
   * 通过配置文件获取
   * @param {配置文件的路径} path
   */
  static async getStationModelByConfig (path) {
    const stationObj = await this.readConfigurationFile(path)
    return this.getStationModel(stationObj)
  }
  /**
   * 通过设置获取
   * @param {stationObj 配置的对象} stationObj
   */
  static getStationModel (stationObj) {
    const stationURL = stationObj.stationURL // 必须
    const stationName = stationObj.stationName || stationURL // 非必须
    const headerFlog = stationObj.headerFlog || true // 默认值
    const headers = stationObj.headers // 非必须
    const fetchType = stationObj.fetchType || 'static' // 默认值
    const fetchAllFlog = stationObj.fetchAllFlog || false // 默认值
    const firstPage = stationObj.firstPage // 必须
    const pageEncodeType = stationObj.pageEncodeType || 'utf8' // 非必须 默认值为utf 8
    const mongooDBContect = stationObj.mongooDBContect // 非必须
    const redisConnect = stationObj.redisConnect // 非必须
    const maxConnectNumber = stationObj.maxConnectNumber || 5 // 默认值
    const maxPageNumber = stationObj.maxPageNumber || 5 // 默认值
    const pageRules = stationObj.pageRules // 必须
    const userName = stationObj.userName // 非必须
    const password = stationObj.password // 非必须
    const proxyFlog = stationObj.proxyFlog || false // 默认值
    const proxyIPS = stationObj.proxyIPS // 非必须
    return new Station(
      stationURL,
      stationName,
      headerFlog,
      headers,
      fetchType,
      fetchAllFlog,
      firstPage,
      pageEncodeType,
      mongooDBContect,
      redisConnect,
      maxConnectNumber,
      maxPageNumber,
      pageRules,
      userName,
      password,
      proxyFlog,
      proxyIPS
    )
  }
  // /**
  //  * 获取static  的信息数组
  //  */
  // get stationMsg () {
  //   return this.stationMsg
  // }
  // /**
  //  * 设置信息数组
  //  */
  // set stationMsg (stationMsg) {
  //   this.stationMsg = stationMsg
  // }

  static async readConfigurationFile (configurationPath) {
    try {
      const station = await fs.readFileAsync(configurationPath)
      const stationObj = JSON.parse(station)

      if (!stationObj) {
        throw new Error()
      } else if (!stationObj.stationURL || !stationObj.firstPage || !stationObj.pageRules) {
        throw new Error()
      } else {
        return stationObj
      }
    } catch (error) {
      throw new Error('station readConfigurationFile Error' + error)
    }
  }
  /**
   * 读取头部配置文件
   * @param {头部的配置文件的地址} headerConfigPath
   */
  async readHeaderConfigrationFile (headerConfigPath) {}
  /**
   * 创建头部配置文件
   * @param {头部配置文件的地址} headerConfigPath
   */
  async writeHeaderConfigrationFile (headerConfigPath) {}
  /**
   * 创建一些头部供使用
   * @param {头部配置文件的地址} headerConfigPath
   */
  async createHeaders (headerConfigPath) {}
  /**
   *  获取一个随机的头部
   */
  async getHeaders () {}
  /**
   * 生成一个Fetch 的 数据模型  Mongoose的模型
   */
  async createFetchModel () {
    const successFlog = await createModel.create()
  }
  /**
   * 后期更改
   */
  geturls (array) {
    array.forEach((element, index) => {
      if (!this.stationLinkMap.get(element)) {
        // 如果map 内没有这个链接 或者这个链接没有下载过  存储到map  中
        this.stationLinkMap.set(element, 0)
      }
    })
    const urlarr = []
    this.stationLinkMap.forEach((value, key, map) => {
      // 如果这个没有被下载过则添加到数组中
      if (!value) {
        urlarr.push(key)
      }
    })
    return urlarr // 返回链接的数组  没有被下载过的
  }

  getfetchurl (array) {
    // 从数组中取出一些链接
    const urls = this.geturls(array)
    const fetchUrls = []
    for (let i = 0; i < this.MAX_PAGE_NUMBER; i++) {
      // 循环取出
      const url = urls.shift() // 取出一个
      this.stationLinkMap.set(url, 1) // 在map 中把这个url做一个下载过的标记
      fetchUrls.push(url)
    }

    return fetchUrls // 返回这个url
  }
  /**
   *
   * @param {需要访问的url相对于baseurl的地址} url
   */
  _$get (url) {
    // 做头部处理
    const baseHeader = this.getRandomHeaders(url) || this.STATION_HEADERS
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
  /**
   *
   * @param {要抓取的页面} url
   * @param {*需要设置的头部信息} opitions
   */
  getRandomHeaders (url, opitions) {
    const userAgent = this.getUserAgent()
    const header = {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'max-age=0',
      Connection: 'close',
      Host: url || this.STATION_URL,
      Referer: this.STATION_URL,
      'User-Agent': userAgent
    }
    if (opitions) {
      for (const key in opitions) {
        header[key] = opitions[key]
      }
    }
    return header
  }
  async getUserAgent () {
    const uas = await fs.readFileAsync('../../useragent.json')
    const uaObjects = JSON.parse(uas)
    const uaList = uaObjects['ua']
    const num = Math.floor(Math.random() * 49.9)
    const ua = uaList[num]
    return ua
  }
  /**
   *静态获取页面的方法
   * @param {需要抓取的页面数组} urls
   * @returns {抓取的静态页面的数组} resps
   */
  async fetchPage (urls) {
    const resps = []
    for await (const url of urls) {
      const r = await this._$get(url)
      if (r.data && r) {
        let pageMsg = {}
        pageMsg[url] = r.data
        resps.push(pageMsg)
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
   * @param { 头部设置} headeroptions
   * @param {自定义抓取函数} callback
   * @returns {resps} 抓取到的页面信息
   */
  async fetchPageDynamic (urls, callback) {
    const headeroptions = this.getHeaders()
    const resps = await headless(urls, headeroptions, callback)
    if (!resps || resps.length < 1) {
      throw new Error('没有找到返回资源')
    }
    return resps
  }

  /**
   * 通过页面信息抓取A链接
   * @param {含有页面信息的数组} pageMsgs
   * @return {要抓取页面上的url}
   */
  fetchAllLinks (pageMsgs) {
    const allLinks = new Set()
    pageMsgs.forEach(pageMsg => {
      for (var name in pageMsg) {
        const pageLinks = $(pageMsg[name]).find('a')
        for (let i = 0; i < pageLinks.length; i++) {
          allLinks.add(pageLinks[i])
        }
      }
    })
    return Array.from(allLinks)
  }
  /**
   *
   * @param {放有页面链接的数组} list
   * @return {页面链接的href的数组} array
   */
  getlinksHref (list) {
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
              urls.push(this.STATION_URL + attribs.href)
            } else {
              if (attribs.href.indexOf(this.STATION_URL) === -1) {
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
   *遍历打印对象
   * @param {*需要被遍历的对象} obj
   */
  ShowTheObject (obj) {
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
  filterYouNeed (pages) {
    const pageMsgs = []
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      let pageSelectorMsg = {}
      for (var name in page) {
        pageSelectorMsg = this.filterPageByRules(page[name])
        if (!pageSelectorMsg) {} else {
          let pageMsg = {}
          pageMsg[name] = pageSelectorMsg
          pageMsgs.push(pageMsg)
        }
      }
    }

    if (pageMsgs.length < 1) {
      console.log('SelectMsgsAttr 358')
      return false
    }
    return pageMsgs
  }
  filterPageByRules (page) {
    const pageRules = this.FETCH_PAGE_RULES
    if (pageRules instanceof Array) {
      for (let i = 0; i < pageRules.length; i++) {
        const rule = pageRules[i]
        for (const key in rule) {
          if (rule.hasOwnProperty(key)) {
            const ruleName = key
            const ruleSelector = rule[key]['selector'] // 获取的选择器
            const ruleAttr = rule[key]['attr'] // 获取元素的属性
            if (!ruleName || !ruleSelector || !ruleAttr) {
              throw new Error('pageRoles illegal')
            } else {
              const pageSelectMsg = $(page).find(ruleSelector)
              if (!pageSelectMsg || pageSelectMsg === '' || pageSelectMsg.length === 0) {
                // 没有此元素
                return false
              } else {
                // 页面能找到这个元素  把这个元素要提取的属性提取出来
                const SelectMsgsAttr = this.filterSelectMsgAttr(pageSelectMsg, ruleAttr)
                if (!SelectMsgsAttr) {
                  console.log('SelectMsgsAttr 382')
                  return false
                } else {
                  let pagefetchAttr = {}
                  pagefetchAttr[ruleName] = SelectMsgsAttr
                  console.log(pagefetchAttr[ruleName].length)
                  return pagefetchAttr
                }
              }
            }
          }
        }
      }
    } else {
      throw new Error('pageRoles illegal')
    }
  }
  filterSelectMsgAttr (pageMsgs, ruleAttr) {
    const pageAttrs = []

    pageMsgs.each((index, item) => {
      for (const attrKey in ruleAttr) {
        if (ruleAttr.hasOwnProperty(attrKey)) {
          const ruleElement = ruleAttr[attrKey]
          let fetchvalue

          switch (attrKey) {
            case 'attr':
              if ($(item).attr(ruleElement)) {
                fetchvalue = $(item).attr(ruleElement)
              }
              break
            case 'text':
              if ($(item).text()) {
                fetchvalue = $(item).text()
              }
              break
            case 'html':
              if ($(item).html()) {
                fetchvalue = $(item).html()
              }
              break
            case 'rex-value':
              for (const itemKey in $(item).attr()) {
                if (item.hasOwnProperty(itemKey)) {
                  const itemElement = item[itemKey]

                  if (itemElement.value && itemElement.value.match(ruleElement)) {
                    fetchvalue = itemElement.value
                  } else {
                    fetchvalue = null
                  }
                }
              }

              break
            case 'rex-key':
              for (const itemKey in item) {
                if (item.hasOwnProperty(itemKey)) {
                  const itemElement = item[itemKey]

                  if (itemKey && itemKey.match(ruleElement)) {
                    fetchvalue = itemElement.value
                  } else {
                    fetchvalue = null
                  }
                }
              }
              break
          }
          if (!fetchvalue || fetchvalue === '') {} else {
            let selectorMsg = {}
            selectorMsg[$(item).html()] = fetchvalue
            pageAttrs.push(selectorMsg)
          }
        }
      }
    })

    return pageAttrs
  }
  /**
   * 决定使用抓取的方法
   * @param {需要抓取的链接} urls
   */
  async fetchPageDetamine (urls) {
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
    const pageMsgs =
      this.STATION_FETCH_TYPE === 'static' ? await this.fetchPage(urls) : await this.fetchPageDynamic(urls) // 抓取入口页 获取入口页信息
    return pageMsgs
  }

  /**
   *循环抓取
   * @param {需要抓取的链接数组} urls
   */
  async fetchLoop (urls) {
    const pageMsgs = await this.fetchPageDetamine(urls) // 获取到其他页面的页面信息
    // 通过页面信息  获取这些页面上的链接  并过滤出href  并且存储起来
    const PageLinks = this.fetchAllLinks(pageMsgs) // 获取入口页信息中的a链接
    const PageHrefs = this.getlinksHref(PageLinks) // 获取入口页的 href  属性
    // 通过页面信息  获取这些页面上的需要过滤的数据  并且存储起来
    const fetchUrls = this.getfetchurl(PageHrefs) // 获取几个要下载的urls
    const filterpageMsg = this.filterYouNeed(pageMsgs)

    if (filterpageMsg) {
      this.stationMsg.push(filterpageMsg)
    }
    if (fetchUrls.length !== 0) {
      this.fetchLoop(fetchUrls)
    }
  }

  /**
   * init  执行方法
   */
  async init () {
    const firstPageMsg = await this.fetchPageDetamine(this.FETCH_FIRST_PAGE)
    for (var name in firstPageMsg[0]) {
      console.log(name, 'firstPageMsg')
    }

    const filterpageMsg = this.filterYouNeed(firstPageMsg)
    if (filterpageMsg) {
      this.stationMsg.push(filterpageMsg)
    }
    if (this.FETCH_ALL_FLOG) {
      const firstPageLinks = await this.fetchAllLinks(firstPageMsg) // 获取入口页信息中的a链接
      const firrstPageHrefs = await this.getlinksHref(firstPageLinks) // 获取入口页的 href  属性
      const urls = this.getfetchurl(firrstPageHrefs) // 获取几个要下载的urls
      console.log(urls)
      this.fetchLoop(urls)
    }
  }
};
(async () => {
  const station = await Station.getStationModelByConfig('../../peizhi.json')
  await station.init()
})()
