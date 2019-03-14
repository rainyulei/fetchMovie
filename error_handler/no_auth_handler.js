const noAuthHandler = require('../error/no_auth_error')
const loggor = require('../logger/logger')
module.exports = function (options) {
  return (err, req, res, next) => {
    if (err instanceof noAuthHandler) {
      loggor.error('some one no auth want read source', {
        message: err.message,
        code: err.code,
        query: req.query,
        url: req.url
        // userInfo: req.session.user || '无用户'
      })
      res.statusCode = err.statusCode
      res.json({
        code: err.errCode,
        msg: err.httpMsg
      })
    } else {
      next(err)
    }
  }
}
