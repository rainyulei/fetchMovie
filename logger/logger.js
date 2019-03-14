const {
  createLogger,
  transports
} = require('winston')
require('winston-daily-rotate-file')
const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: './logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      level: 'info',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new transports.DailyRotateFile({
      filename: './logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
})
module.exports = logger
