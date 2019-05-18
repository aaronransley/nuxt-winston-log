import { extractReqInfo } from '../utils'

export function capture(req, res, context) {
  const reqInfo = extractReqInfo(req)
  const capturePath = context.winstonOptions.capturePath
  const csrfToken = context.csrfToken
  const clientCsrf = req.headers['x-plumbus']

  // Check for CSRF business
  const securedEnvironment = context.processEnv !== 'development'
  const csrfTokenValid = clientCsrf === csrfToken

  if (!csrfTokenValid && securedEnvironment) {
    context.logger.warn(
      `Incorrect CSRF during ${capturePath}. Client (${clientCsrf}) vs server (${csrfToken})`,
      {
        reqInfo
      }
    )
    res.end(
      `Issue during ${capturePath}: invalid plumbus supplied. Client (${clientCsrf}) vs server (${csrfToken})`
    )
    return
  }
  // }

  let body = ''

  // Stream data into utf8-encoded body
  req.setEncoding('utf8')
  req.on('data', chunk => {
    body += chunk
  })

  // Act on request body
  req.on('end', () => {
    const jsonBody = JSON.parse(body)
    const messageType = jsonBody.type == 'error' ? 'error' : 'info'
    try {
      if (messageType == 'error') {
        logClientError(context.logger, reqInfo, jsonBody)
      } else {
        logClientInfo(context.logger, reqInfo, jsonBody)
      }
    } catch (error) {
      context.logger.error(new Error(error), {
        reqInfo
      })
      res.end(`Issue during ${capturePath}: ${error}`)
    } finally {
      if (!res.finished) {
        res.end(`${messageType} logged`)
      }
    }
  })
}

function logClientError(logger, reqInfo, jsonBody) {
  let allButSpecial = { ...jsonBody.data }
  delete allButSpecial.message
  delete allButSpecial.name
  delete allButSpecial.stack

  let firstLine = jsonBody.data.message
  if (jsonBody.data.name) {
    firstLine = `${jsonBody.data.name}: ${firstLine}`
  }

  logger.error(`FromClient: ${firstLine}`, {
    ...allButSpecial,
    stack: jsonBody.data.stack,
    fromClient: true,
    reqInfo
  })
}

function logClientInfo(logger, reqInfo, jsonBody) {
  let allButMessage = { ...jsonBody.data }
  delete allButMessage.message

  logger.info(`FromClient: ${jsonBody.data.message}`, {
    ...allButMessage,
    fromClient: true,
    reqInfo
  })
}
