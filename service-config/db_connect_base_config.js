module.exports = {
  OPTIONS: {
    useNewUrlParser: true,
    reconnectTries: Number.MAX_VALUE, // 等待重连
    reconnectInterval: 500, // 重连等待
    poolSize: 10, // 最大连接数 连接池
    authSource: 'admin', // 连接权限
    bufferMaxEntries: 0
  },
  DB_URL: 'mongodb://localhost:27017/pachong'
}
