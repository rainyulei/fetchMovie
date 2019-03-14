module.exports = function () {
  return {
    scopeMe: 'https://www.googleapis.com/auth/plus.me',
    scopeLogin: 'https://www.googleapis.com/auth/plus.login', // Know the list of people in your circles, your age range, and language
    scopeEmail: ' https://www.googleapis.com/auth/userinfo.email', // View your email address
    scopeProfile: 'https://www.googleapis.com/auth/userinfo.profile', // View your basic profile info
    tokenrefreshURI: 'https://www.googleapis.com/oauth2/v4/token', // 刷新tokenuri
    authorizationURL: 'https://accounts.google.com/o/oauth2/auth', // 获取codeapi
    tokenURL: 'https://accounts.google.com/o/oauth2/token', // 获取accresstoken 地址
    clientID: '106653763998-t3bdkf2hcqv2oq6kh31vi1fdf0tn3oav.apps.googleusercontent.com',
    clientSecret: '6N8ompykvkFm7t86wFxinq-b',
    callbackURL: 'http://yangandyu.com:3000/auth/google/callback'
  }
}
