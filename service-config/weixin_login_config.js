const oriangenalURI = 'yangandyu.com:3000/'
const encodeURI = encodeURIComponent(oriangenalURI)
console.log('encodeURI :', encodeURI)
const options = {
  appID: 'wx1bfb322f09a8007d',
  appsecret: 'fa4d683143ae12c0fb6e2c73f2408c11',
  redirect_url: 'localhost:3000/movies',
  scope: 'snsapi_userinfo',
  oriangenalURI: oriangenalURI,
  encodeURI: encodeURI
}

module.exports = function () {
  return options
}
