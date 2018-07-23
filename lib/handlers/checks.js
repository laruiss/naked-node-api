const _data = require('../data')
const helpers = require('../helpers')

// Users handlers
const _checks = {
  async post(data, callback) {
    const protocol = data.payload.protocol
    const url = data.payload.url
    const method = data.payload.method
      && ['post', 'get', 'put', 'delete'].includes(data.payload.method)
      && data.payload.method
    const successCodes = data.payload.successCodes 
    const timeoutSeconds = data.payload.timeoutSeconds

    if (!(protocol, url, method, successCodes, timeoutSeconds)) {
      callback(400, { error: 'Missing or invalid inputs' })
    }

    // Get token from headers
    const tokenId = data.headers.token

    // Lookup the user
    const token = await _data.read('tokens', tokenId)
    const userPhone = token.phone
    const user = await _data.read('users', userPhone)
    const userChecks = user.checks || []
    if (userChecks.length > 4) {
      callback(400, { error: `The user ${userPhone} has already the max amount of checks`})
    }
    const checkId = helpers.createRandomString(20)
    const newCheck = {
      id: checkId,
      userPhone,
      protocol,
      url,
      method,
      successCodes,
      timeoutSeconds,
    }
    // Create check object and include the user's phone
    newCheck
    userChecks.push(newCheck)
    const check = _data.create('checks', checkId, newCheck)
    user.checks = userChecks
    try {
      await _data.update('users', userPhone, user)
      callback(201)
    } catch (error) {
      callback(400, { error: `Could not update user ${userPhone}`} )
    } 
  },
  // Get a check by its id
  // Required data : id
  async get (data, callback) {
    const id = data.queryStringObject.id
    if (!id) {
      callback(400, { error: 'Missing required parameter: id'})
      return
    }
    const tokenId = data.headers.token
    try {
      const check = await _data.read('checks', id).catch(e => {
        throw new Error('Token not found')
      })

      const token = await _data.read('tokens', tokenId)
      if (!token) {
        callback(403, { error: 'Missing or invalid token' })
      }

      callback(200, check)
    } catch (error) {
      callback(404, { error: error.message, originalError: error })
    }
  },
}

// The checks handler
const checks = (data, callback) => {
  // Acceptable methods
  const acceptableMethods = ['post', 'put', 'get', 'delete']
  if (!acceptableMethods.includes(data.method)) {
    callback(405)
  }

  // Use the appropriate handler
  _checks[data.method](data, callback)
}

module.exports = checks
