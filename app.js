var express = require('express')
// const helmet = require('helmet')

var path = require('path')
var cookieParser = require('cookie-parser')
var bodyparse = require('body-parser')
var logger = require('morgan')
const passport = require('passport')
/**
 * 引入中间件
 */
const googleThirdpart = require('./services/thirdPart_google')
/**
 * 引入错误处理模块
 */
const httpErrorHandler = require('./error_handler/http_error_handler')
const errorHandler = require('./error_handler/error_handler')
/**
 * 引入校验中间件
 */
const verifyIsComputer = require('./utils/verifyIsComputer')
const verify = require('./utils/verifyToken')
/**
 * 引入router
 */
const moviesRouter = require('./routes/movies')
const usersRouter = require('./routes/users')
const thirdpartRouter = require('./routes/thirdPart_login')

// const User = require('./services/userService')
const app = express()
/**
 * 设置helmet  安全
 */
// // app.use(helmet())
// app.use(helmet({
//   frameguard: {
//     action: 'deny'
//   }
// }))

/**
 * 设置全局的响应头
 * 包括 x-powered-by 设置为版本数字 verison
 */
// app.use((req, res, next) => {
//   res.set('x-powered-by', 'verison 0.0.1')
// })

app.set('views', path.join(__dirname, 'views')) // 设置渲染路径
app.use(bodyparse.json())
app.use(
  bodyparse.urlencoded({
    extended: true // 可以解析数组和对象
  })
)
app.use(logger('dev'))
app.use(cookieParser('leiyus'))
app.use(express.static(path.join(__dirname, 'public'))) // 静态资源处理可以访问
passport.use(googleThirdpart)
/**
 * 路由
 */

app.use('*', verifyIsComputer())
app.use('/auth/google', thirdpartRouter)
app.use('/users', usersRouter)
app.use('*', verify.verifyTokenMiddle())
app.use('/movies', moviesRouter)
/**
 * 错误处理
 */
app.use(httpErrorHandler())
app.use(errorHandler())
app.on('uncaughtException', err => {
  console.log(err)
  process.exit()
})
app.on('unhandleRejection', (reason, p) => {
  console.log(reason)
  console.log(p)
  process.exit()
})

module.exports = app
