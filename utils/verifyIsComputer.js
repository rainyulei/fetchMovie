/**
 * 验证请求的真假
 * 反爬虫中间件
 */
module.exports = function () {
  return (req, res, next) => {
    const acceptLanguage = req.headers['accept-language']
    const acceptEncoding = req.headers['accept-encoding']
    const referer = req.headers['referer']
    const userAgent = req.headers['user-agent']
    const accept = req.headers['accept']
    const host = req.headers['host']
    const ip = req.ip
    if (!acceptLanguage ||
      !acceptEncoding ||
      !referer ||
      !userAgent ||
      !accept ||
      !host ||
      !ip
    ) {
      res.json({
        code: 404,
        msg: 'can find resoleve'
      })
    } else {
      next()
    }
  }
}
