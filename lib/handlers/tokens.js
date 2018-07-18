const helpers = require('../helpers')
const _data = require('../data')

// Users handlers
const _tokens = {
  async post (data, callback) {
    const {
      phone,
      password,
    } = data.payload

    if (!phone || !password) {
      callback(400, { error: 'Missing required fields' })
    }

    try {
      const user = await _data.read('users', phone)
      if (user.password !== helpers.hash(password)) {
        callback(400, { error: 'Password did not match' })
      }
      // Password match, so create a token
      const id = helpers.createRandomString(20)
      const expires = Date.now() + 1000 * 60 * 80
      const token = {
        id,
        expires,
        phone,
      }
      try {
        await _data.create('tokens', id, token)
        callback(201, token)
      } catch (error) {
        callback(500, { error: 'Could not create the new token', originalError: error, stack: error.stack })
      }
    } catch (error) {
      callback(500, { error: 'Could not create the new token', originalError: error, stack: error.stack })
    }
  },
  get (data, callback) {
  },
  put (data, callback) {
  },
  delete (data, callback) {
  },
}

// The main users handler
const tokens = (data, callback) => {
  // Acceptable methods
  const acceptableMethods = ['post', 'put', 'get', 'delete']
  if (!acceptableMethods.includes(data.method)) {
    callback(405)
  }

  // Use the appropriate handler
  _tokens[data.method](data, callback)
}

module.exports = tokens
