import path from 'path'
import uuidv1 from 'uuid/v1'
import { createLogger, format, transports } from 'winston'
import { capture } from './serverMiddleware/capture'
import { extractReqInfo } from './utils'

const csrfToken = uuidv1()
const pkg = require('./package.json')
const { combine, timestamp, json, errors } = format

require('winston-daily-rotate-file')

module.exports = function WinstonLog() {
  const winstonOptions = { capturePath: '/_capture', ...this.options.winstonLog }
  const logger = createLogger({
    exitOnError: false,
    format: combine(timestamp(), errors({ stack: true }), json()),
    transports: [
      new transports.DailyRotateFile({
        filename: `${process.env.NODE_ENV}-%DATE%.log`,
        dirname: path.resolve(process.cwd(), 'logs/'),
        maxSize: '500m',
        maxFiles: '30d',
        zippedArchive: true,
        ...winstonOptions.transportOptions
      })
    ]
  })

  this.nuxt.moduleContainer.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    mode: 'client',
    options: { csrfToken, capturePath: winstonOptions.capturePath }
  })

  this.nuxt.moduleContainer.addServerMiddleware({
    path: winstonOptions.capturePath,
    handler: (req, res) => {
      return capture(req, res, {
        winstonOptions,
        logger,
        csrfToken,
        processEnv: process.env.NODE_ENV
      })
    }
  })

  this.nuxt.hook('render:setupMiddleware', app =>
    app.use((req, res, next) => {
      logger.info(`Accessed ${req.url}`, {
        reqInfo: extractReqInfo(req)
      })
      next()
    })
  )

  this.nuxt.hook('render:errorMiddleware', app =>
    app.use((err, req, res, next) => {
      logger.error(new Error(err), {
        reqInfo: extractReqInfo(req)
      })
      next(err)
    })
  )
}

module.exports.meta = pkg
