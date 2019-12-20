import path from 'path'
import { createLogger, format, transports } from 'winston'
import {
  checkHeadersAccepts,
  checkHeadersContentType,
  extractReqInfo,
  mkdirIfNotExists
} from './utils'

const pkg = require('./package.json')
const { combine, timestamp, json, errors } = format

module.exports = function WinstonLog() {
  const winstonOptions = {
    logPath: './logs',
    logName: `${process.env.NODE_ENV}.log`,
    ...this.options.winstonLog
  }

  mkdirIfNotExists(path.resolve(process.cwd(), winstonOptions.logPath))

  const logger = createLogger({
    exitOnError: false,
    format: combine(timestamp(), errors({ stack: true }), json()),
    transports: [
      new transports.File({
        filename: path.resolve(winstonOptions.logPath, winstonOptions.logName),
        ...winstonOptions.transportOptions
      })
    ],
    ...winstonOptions.loggerOptions
  })

  this.nuxt.hook('render:setupMiddleware', app =>
    app.use((req, res, next) => {
      const reqInfo = extractReqInfo(req)
      const isHtmlOrJson =
        checkHeadersAccepts(reqInfo.headers, ['text/html', 'application/xhtml']) ||
        checkHeadersContentType(reqInfo.headers, ['application/json'])
      const isInternalNuxtRequest = reqInfo.url && reqInfo.url.includes('/_nuxt/')

      if (isHtmlOrJson && !isInternalNuxtRequest) {
        logger.info(`Accessed ${req.url}`, {
          ...reqInfo
        })
      }
      next()
    })
  )

  this.nuxt.hook('render:errorMiddleware', app =>
    app.use((err, req, res, next) => {
      const newError = new Error(err)
      newError.stack = err.stack
      logger.error(newError, {
        ...extractReqInfo(req)
      })
      next(err)
    })
  )
}

module.exports.meta = pkg
