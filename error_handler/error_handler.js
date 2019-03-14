const loggor = require('../logger/logger')
module.exports = function (options) {
  return (err, req, res, next) => {
    if (err) {
      loggor.error('uncaught error in middleware process', {
        message: err.message,
        code: err.code,
        query: req.query,
        url: req.url
        // userInfo: req.session.user || '无用户'
      })
      res.json({
        code: 500 || err.errCode
      })
    } else {
      next()
    }
  }
}
