import Vue from 'vue'
import fetch from 'cross-fetch'
import serializeError from 'serialize-error'

Vue.config.errorHandler = function(err, vm, info) {
  fetch(`<%= options.capturePath %>`, {
    method: 'post',
    headers: {
      Accept: 'text/plain',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'error',
      data: {
        ...serializeError(err)
      }
    })
  })
}
