const crypto = require('crypto')

const config = require('./config')

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

const possibleChars = 'abcdefghijklmnopqrstuvwxyz1234567890'
// Create a random alphanum string of the specified length
const createRandomString = (length) => {
  const strLength = typeof(length) === 'number' && length > 10 ? length : 20
  let str = ''
  for (let i = 1; i <= strLength; i++) {
    const randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
    str += randomChar
  }
  return str
}

module.exports = {
  hash,
  parseJsonToObject,
  createRandomString,
}