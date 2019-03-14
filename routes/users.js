const express = require('express')
const crypto = require('crypto')
const pbkdf2Async = require('bluebird').promisify(crypto.pbkdf2)
const JWT = require('jsonwebtoken')
const PBKOptions = require('../service-config/PBKOptions')
const encryty = require('../utils/encryption')
const encrytiOptions = require('../service-config/encryption_options')
// const createweichatOptions = require('../service-config/weixin_login_config')
// const weichatOptions = createweichatOptions()
const JWToptions = require('../service-config/JWToptions')
const UserService = require('../services/userService')
const router = express.Router()
const verify = require('../utils/verifyToken')
const verifyrecaptcha = require('../utils/verifyrecaptcha')

/**
 * 登录模块 这里要发放令牌 做密码的加密
 * 传入方法使用post 传入用户名密码
 * username password前端获取的用户名 需要通过前端的AESkey  进行解密
 * docPassword， docUsername 经过解码的真实用户名和密码
 * cpassword 经过pbkdf2 加密的密码 存到数据库中
 * token 和refreshtoken 都经过后端AES 的key  进行加密
 */
router.post('/Login', function (req, res, next) {
  ;
  (async () => {
    const {
      username,
      password
    } = req.body

    const key = await encryty.getFrontAESKey() // 获取前端AESkey
    const docPassword = await encryty.decryptRSA(password) // 解码
    const docUsername = await encryty.decryptAES(username, key.AES_KEY, key.AES_IV) // 解码
    const cpassword = await pbkdf2Async( // 重新加密密码不可逆
      docPassword,
      PBKOptions.SALT,
      PBKOptions.ITERATIONS,
      PBKOptions.KEYLEN,
      PBKOptions.DIGEST
    )

    const userEntry = await UserService.login({ // 验证
      username: docUsername,
      password: cpassword
    })
    if (!userEntry[0]) {
      res.json({
        doc: {
          code: 10001,
          msg: 'sorry your username or password wrong'
        }
      })
    }
    const user = {
      username: docUsername,
      expireAt: Date.now().valueOf() + JWToptions.expireIn
    }
    const refreshTokenObject = {
      username: docUsername,
      expireAt: Date.now().valueOf() + JWToptions.refreshTokenExpireIn
    }
    const token = JWT.sign(user, JWToptions.SECRET) // token签名
    const refreshToken = JWT.sign(refreshTokenObject, JWToptions.refreshTokenSecret) // 刷新令牌签名
    const backKey = await encryty.getBackAESKey() // 后端aeskey
    const ctoken = await encryty.encryptAES(token, backKey.AES_KEY, backKey.AES_IV) // 加密
    const crefreshtoken = await encryty.encryptAES(refreshToken, backKey.AES_KEY, backKey.AES_IV) // 加密
    res.json({ // 发送token
      code: 200,
      username: docUsername,
      token: ctoken,
      refreshToken: crefreshtoken
    })
  })()
    .catch(e => {
      console.log(`${e}userrouter`)
    })
})

/**
 * 注册接口不需要做权限验证
 * 需要做人机验证
 */
router.post('/regiest', (req, res, next) => {
  const username = req.body.username
  const password = req.body.password
  const email = req.body.email
  const gender = req.body.gender

  if (!username || !password || !email) {
    throw new Error('message is empty') // todo 校验
  };
  (async () => {
    const key = await encryty.getFrontAESKey() // 获取前端AESkey
    const docPassword = await encryty.decryptRSA(password) // 解码
    const docUsername = await encryty.decryptAES(username, key.AES_KEY, key.AES_IV) // 解码
    const docEmail = await encryty.decryptAES(email, key.AES_KEY, key.AES_IV) // 解码
    const cpassword = await pbkdf2Async(
      docPassword,
      PBKOptions.SALT,
      PBKOptions.ITERATIONS,
      PBKOptions.KEYLEN,
      PBKOptions.DIGEST
    )
    const userFlog = (await UserService.findUserByUserName(username)) && (await UserService.findUserByEmail(email))
    if (!userFlog) {
      res.json({
        code: '405',
        errMsg: '用户名或者邮箱已经存在'
      })
    } else {
      const addUserFlog = UserService.addUser({
        username: docUsername,
        password: cpassword,
        email: docEmail,
        gender: gender
      })
      if (!addUserFlog) {
        res.json({
          code: '405',
          errMsg: '存入失败'
        })
      }
      res.json({
        code: '200',
        success: true,
        Msg: '成功'
      })
    }
  })()
    .then(r => {})
    .catch(e => {})
})
router.post('/forgetPassword', (req, res, next) => {
  console.log(req.body.email)
})
/**
 * 用户存在token直接登录
 */
router.post('/tokenLogin', (req, res, next) => {
  const authorization = req.headers.authorization
  const refreshtoken = req.headers.refreshtoken;
  (async () => {
    const user = await verify.verifyToken(authorization, refreshtoken)
    const token = JWT.sign(user, JWToptions.SECRET)
    const backKey = await encryty.getBackAESKey()
    const ctoken = await encryty.encryptAES(token, backKey.AES_KEY, backKey.AES_IV) // 加密
    return {
      user,
      ctoken
    }
  })()
    .then(r => {
      if (!r.user) {
        res.json({
          code: 404,
          message: "can't find"
        })
      } else {
        res.json({
          code: 200,
          username: r.user.username,
          token: r.ctoken,
          refreshtoken
        })
      }
    })
    .catch(e => {
      // todo error
      console.log(e, 'user router login')
    })
})
/**
 * google recaptcha 人机验证
 */
router.post('/grecaptcha', (req, res, next) => {
  const token = req.body.token
  const ip = req.ip;
  (async () => {
    const flog = await verifyrecaptcha(token, ip)
    const aesKey = await encryty.getFrontAESKey()
    const rsaKey = await encryty.getRSAPublicKey()
    if (flog) {
      res.json({
        code: 200,
        success: true,
        RSA: {
          key: rsaKey
        }
      })
    } else {
      // 不让登录
      res.json({
        code: 404,
        Msg: '没有权限'
      }) // 异常机器人处理
    }
  })()
})
/**
 * 发送aeskey
 */
router.get('/aes', (req, res, next) => {
  (async () => {
    const aesKey = await encryty.getFrontAESKey()
    res.json({
      code: 200,
      success: true,
      AES: {
        key: aesKey, // 文件内有IV （偏移向量）和key（加密钥匙）
        algorithm: encrytiOptions.AES.ALGORITHM // 加密方法
      }
    })
  })()
    .catch(e => {
    // todo error
    })
})
module.exports = router
