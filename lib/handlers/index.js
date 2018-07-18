/*
 * Request handlers
 */
const users = require('./users')
const tokens = require('./tokens')


// Ping handler
const ping = (data, callback) => {
  // Callback a http status code, and a payload object
  callback(200)
}


const notFound = (data, callback) => {
  // Callback a http status code, and no payload object
  callback(404)
}

module.exports = {
  ping,
  notFound,
  users,
  tokens,
}