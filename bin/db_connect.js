const mongoose = require('mongoose')
const {
  OPTIONS,
  DB_URL
} = require('../service-config/db_connect_base_config')
const connect = mongoose.connect(DB_URL, OPTIONS)
mongoose.connection.on('connected', function () {
  console.log('mongoDB contected success')
})
mongoose.connection.on('error', function () {
  console.log('mongoDB contected fail')
  process.exit(1)
})
mongoose.connection.on('disconnected', function () {
  console.log('mongoDB contected disconnected')
  process.exit(2)
})
module.exports = connect
