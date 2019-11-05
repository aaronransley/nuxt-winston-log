import Vue from 'vue'
import fetch from 'cross-fetch'

Vue.config.errorHandler = function(err, vm, info) {
  fetch(`<%= options.capturePath %>`, {
    method: 'post',
    headers: {
      Accept: 'text/plain',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      {
        type: 'error',
        data: {
          err
        }
      },
      replaceErrors
    )
  })
}

function replaceErrors(key, value) {
  if (value instanceof Error) {
    var error = {}
    Object.getOwnPropertyNames(value).forEach(function(key) {
      error[key] = value[key]
    })
    return error
  }
  return value
}
