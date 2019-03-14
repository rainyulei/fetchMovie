const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const User = require('../models/mongoose_model/users_model')
const createGoogleOptions = require('../service-config/Google_login_options')
const googleOptions = createGoogleOptions()
const googleclient = new GoogleStrategy({
  authorizationURL: googleOptions.authorizationURL,
  tokenURL: googleOptions.tokenURL,
  clientID: googleOptions.clientID, // 把option写到配置文件中
  clientSecret: googleOptions.clientSecret,
  callbackURL: googleOptions.callbackURL
},
function (accessToken, refreshToken, profile, done) {
  console.log(`accessToken:${accessToken}`) // TODO  拿到access token了 处理放到用户的jwt 头中
  console.log(`refreshToken:${refreshToken}`) // 拿到refresh token了  长久存储到数据库中 设置时间
  const userInfo = {
    profile,
    refreshToken
  };
  (async () => {
    console.log('=======================================================profile', profile)
    await User.findOneOrCreated(userInfo)
    done(null, userInfo) // 执行这个done方法 userinfo会在callback中拿到
  })()
    .then(r => {})
    .catch(e => {
      done(e)
    })
}
)

module.exports = googleclient
