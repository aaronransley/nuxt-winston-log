import fs from 'fs'

export function extractReqInfo(req) {
  return {
    url: req.url,
    method: req.method,
    headers: req.headers
  }
}

export function mkdirIfNotExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

export function checkHeadersAccepts(headers, accepted) {
  const hasAcceptHeaders = headers.accept
  if (hasAcceptHeaders) {
    return accepted.some(x => headers.accept.includes(x))
  }
  return false
}

export function checkHeadersContentType(headers, contentTypes) {
  const hasContentType = headers['content-type']
  if (hasContentType) {
    return contentTypes.some(x => headers['content-type'].includes(x))
  }
  return false
}
