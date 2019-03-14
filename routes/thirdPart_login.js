const express = require('express')
const passport = require('passport')
const JWT = require('jsonwebtoken')
const createGoogleOptions = require('../service-config/Google_login_options')
const googleOptions = createGoogleOptions()
const JWToptions = require('../service-config/JWToptions')
const router = express.Router()
/**
 * google登录的第一次访问
 */

router.get('/', passport.authenticate('google', {
  accessType: 'offline',
  prompt: 'consent',
  session: false,
  // state: req.params.id,
  scope: [googleOptions.scopeMe, googleOptions.scopeEmail]
}))
/**
 * google登录的回访
 */

router.get('/callback', (req, res, next) => {
  passport.authenticate('google', function (err, userinfo) {
    if (err) {
      console.log(err)
      res.redirect('http://localhost:8080/')
    } else {
      const username = userinfo.profile.displayName

      const user = {
        username,
        expireAt: Date.now().valueOf() + JWToptions.expireIn
      }
      const refreshTokenObject = {
        username,
        expireAt: Date.now().valueOf() + JWToptions.refreshTokenExpireIn
      }
      const token = JWT.sign(user, JWToptions.SECRET)
      const refreshToken = JWT.sign(refreshTokenObject, JWToptions.refreshTokenSecret)
      const url = 'http://localhost:8080/loginmiddle' +
        `?username=${username}&token=${token}&refreshToken=${refreshToken}`
      res.redirect(url)
    }
  })(req, res, next)
})

module.exports = router
