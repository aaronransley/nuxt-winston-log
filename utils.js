export function extractReqInfo(req) {
  return {
    url: req.url,
    method: req.method,
    headers: req.headers
  }
}
