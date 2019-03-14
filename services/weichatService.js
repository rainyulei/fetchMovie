const OAuth = require('wechat-oauth')
const weixinOptions = require('../service-config/weixin_login_config')()
/**
 * 初始化
 */
const client = new OAuth(weixinOptions.appID, weixinOptions.appsecret, function (openid, callback) {
  // 传入一个根据openid获取对应的全局token的方法
  // 在getUser时会通过该方法来获取token
  //   Token.getToken(openid, callback)
}, function (openid, token, callback) {
  // 持久化时请注意，每个openid都对应一个唯一的token!
  //   Token.setToken(openid, token, callback)
})

/**
 * 生成用户点击uri
 */
const createURL = function (redirectUrl, scope) {
  return client.getAuthorizeURL(redirectUrl, scope)
}
/**
 * 换取令牌并存储
 */

const getcode = function (code) {
  client.getAccessToken(code, function (err, result) {
    if (err) throw new Error('no token')
    const accessToken = result.data.access_token
    const openid = result.data.openid
    const refrushToken = result.data.refresh_token
    const expiresIn = result.data.expires_in
  })
}

/***
 * 获取用户信息
 */
const getuser = function (openid) {
  client.getUser(openid, function (err, result) {
    if (err) return
    const userInfo = result
  })
}
module.exports = function () {
  return {
    getuser,
    getcode,
    createURL
  }
}
