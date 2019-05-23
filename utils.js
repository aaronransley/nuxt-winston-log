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
