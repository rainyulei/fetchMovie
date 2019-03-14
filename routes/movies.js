const express = require('express')
// const JWToptions = require('../service-config/JWToptions')
// const JWT = require('jsonwebtoken')
const router = express.Router()
// const fsAsyinc = require('../utils/fs')
/**
 * 读取movie界面
 */
router.get('/', function (req, res, next) {
  (async () => {
    res.json({
      aaa: '111111111111111111111111111'
    })
  })()
    .then(r => {})
    .catch(e => {
      console.log(`${e}`)
    })
})
module.exports = router
