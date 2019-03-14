const HTTPBaseError = require('./http_base_error')
const ERROR_CODE = 4040000
class ResouseNotFound extends HTTPBaseError() {
  constructor (resourceName, resourceId, httpmsg) {
    super(404, httpmsg, ERROR_CODE, `${resourceName}not found,id :${resourceId}`)
  }
}
module.exports = ResouseNotFound
