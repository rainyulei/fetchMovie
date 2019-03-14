const HTTPBaseError = require('./http_base_error')
const ERROR_CODE = 40000
class HTTPRequestParamsError extends HTTPBaseError {
  constructor (paramsName, desc, msg) {
    super(200, desc, ERROR_CODE, `${paramsName}wrong ${msg}`)
  }
}
module.exports = HTTPRequestParamsError
