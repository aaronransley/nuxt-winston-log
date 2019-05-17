import { extractReqInfo } from '../utils'

export function capture(req, res, context) {
  const reqInfo = extractReqInfo(req)
  const capturePath = context.moduleOptions.capturePath

  // Check for CSRF business
  const securedEnvironment = true || context.processEnv !== 'development'
  const csrfTokenValid = req.headers['x-plumbus'] === context.csrfToken

  if (!csrfTokenValid && securedEnvironment) {
    context.logger.warn(`Incorrect CSRF during ${capturePath}`, {
      reqInfo
    })
    res.end(`Issue during ${capturePath}: invalid plumbus supplied`)
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
