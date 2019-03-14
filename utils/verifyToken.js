/**
 * 验证token刷新token的时间
 */
const JWT = require('jsonwebtoken')
const JWToptions = require('../service-config/JWToptions')
const encryty = require('../utils/encryption')
/**
 *
 * @param {token} authorization
 * @param {刷新令牌} refreshToken
 * 校验以及刷新令牌
 */

function refreshTokenTime (user) {
  user.expireAt = Date.now().valueOf() + JWToptions.expireIn
  return user
}

async function verifyToken (authorization, refreshToken) {
  if (!authorization || authorization.indexOf('Bearer ') === -1 || !authorization.split('Bearer ')[1] || !refreshToken) {
    return false
  }
  const token = authorization.split('Bearer ')[1]
  const key = await encryty.getBackAESKey()
  const deToken = await encryty.decryptAES(token, key.AES_KEY, key.AES_IV)
  const deRefreshToken = await encryty.decryptAES(refreshToken, key.AES_KEY, key.AES_IV)
  let user = JWT.verify(deToken, JWToptions.SECRET)
  const refreshTokenObject = JWT.verify(deRefreshToken, JWToptions.refreshTokenSecret)
  if (user.expireAt < Date.now().valueOf() || refreshTokenObject.expireAt < Date.now().valueOf()) {
    return false
  }
  const username = user.username
  if (!username || !refreshTokenObject.username || refreshTokenObject.username !== username) {
    return false
  }
  // 刷新时间
  user = refreshTokenTime(user)
  return user
}
module.exports.verifyToken = verifyToken
/**
 * 设置全局请求头中间件验证token 刷新token时间
 */
module.exports.verifyTokenMiddle = function () {
  return (req, res, next) => {
    (async () => {
      const key = await encryty.getBackAESKey()
      const authorization = req.headers['authorization']
      const refreshToken = req.headers['refreshtoken']
      const user = await verifyToken(authorization, refreshToken)
      if (!user) {
        res.json({
          code: 404,
          message: 'can\'t find'
        })
      } else { // 刷新时间
        const token = JWT.sign(JSON.stringify(user), JWToptions.SECRET)
        const ctoken = await encryty.encryptAES(token, key.AES_KEY, key.AES_IV)
        res.set('TOKEN', ctoken)
        next()
      }
    })()
  }
}
