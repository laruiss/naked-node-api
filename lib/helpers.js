const crypto = require('crypto')

const config = require('../config')

const hash = (str) => {
  if (typeof str !== 'string' || !str) {
    return false
  }
  return crypto.createHmac('sha256', config.hashingSecret)
    .update(str)
    .digest('hex')
}

// Parse a JSON, return empty object instead of throwing an error
const parseJsonToObject = (str) => {
  try {
    return JSON.parse(str)
  } catch (error) {
    return {} 
  }
}

module.exports = {
  hash,
  parseJsonToObject,
}