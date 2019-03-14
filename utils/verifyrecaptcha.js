const $fetch = require('node-fetch')
const recaptchaOptinos = require('../service-config/google_recaptcha.js')

async function verifyrecaptcha (token, ip) {
  const res = await $fetch(recaptchaOptinos.VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `secret=${recaptchaOptinos.SECRET_KEY}&response=${token}&remoteip=${ip}`
  }).then(r => r.json())
  console.log(res)
  if (res.success && res.score > recaptchaOptinos.SCORE) {
    return true
  } else {
    return false
  }
}
module.exports = verifyrecaptcha
