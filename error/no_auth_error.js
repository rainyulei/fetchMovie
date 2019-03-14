const HTTPBaseError = require('./http_base_error')
const ERROR_CODE = 4010000
class ResouseNotFound extends HTTPBaseError() {
  constructor (ip) {
    super(401, '你没有权限访问此资源', ERROR_CODE, `${ip}no auth`)
  }
}
module.exports = ResouseNotFound
