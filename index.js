import path from 'path'
import { createLogger, format, transports } from 'winston'
import { capture } from './serverMiddleware/capture'
import { extractReqInfo, mkdirIfNotExists } from './utils'

const pkg = require('./package.json')
const { combine, timestamp, json, errors } = format

require('winston-daily-rotate-file')

module.exports = function WinstonLog() {
  const winstonOptions = {
    capturePath: '/_capture',
    logPath: './logs',
    ...this.options.winstonLog
  }

  mkdirIfNotExists(path.resolve(process.cwd(), winstonOptions.logPath))

  const logger = createLogger({
    exitOnError: false,
    format: combine(timestamp(), errors({ stack: true }), json()),
    transports: [
      new transports.File({
        filename: path.resolve(winstonOptions.logPath, `${process.env.NODE_ENV}.log`),
        ...winstonOptions.transportOptions
      })
    ]
  })

  this.nuxt.moduleContainer.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    mode: 'client',
    options: { capturePath: winstonOptions.capturePath }
  })

  this.nuxt.moduleContainer.addServerMiddleware({
    path: winstonOptions.capturePath,
    handler: (req, res) => {
      return capture(req, res, {
        winstonOptions,
        logger,
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
