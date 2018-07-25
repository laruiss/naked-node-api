const helpers = require('../helpers')
const _data = require('../data')

// Token handlers
const _tokens = {
  // Create a token if auth is valid
  // Required data : phone, password
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
  // Get a token by its id
  // Required data : id
  async get (data, callback) {
    const pathParts = data.trimmedPath.split('/')
    const id = pathParts.length > 1 && pathParts[1]
    if (!id) {
      callback(400, { error: 'Missing required parameter: id'})
      return
    }
    try {
      const token = await _data.read('tokens', id).catch(e => {
        throw new Error('Token not found')
      })
      callback(200, token)
    } catch (error) {
      callback(404, { error: error.message, originalError: error })
    }
  },
  // Extends token validity
  // Required data: id, extend
  async put (data, callback) {
    // const id = data.payload.id
    const pathParts = data.trimmedPath.split('/')
    const id = pathParts.length > 1 && pathParts[1]
    const extend = data.payload.extend === true
    if (!id || id.length != 20) {
      callback(400, { error: 'Missing or invalid required field: id' })
      return
    }
    try {
      const token = await _data.read('tokens', id).catch(e => {throw new Error('Token not found')})
      if (token.expires < Date.now()) {
        callback(401, {error: 'Token has expired'})
      }
      if (extend) {
        token.expires = Date.now() + 1000 * 60 * 60
      }
      await _data.update('tokens', id, token)
      callback(200, token)
    } catch (error) {
      callback(500, { error: error.message })
    }


  },
  // Delete a token
  // Required param: id
  async delete (data, callback) {
    const pathParts = data.trimmedPath.split('/')
    const id = pathParts.length > 1 && pathParts[1]
    if (!id) {
      callback(400, { error: 'Missing required parameter: id'})
      return
    }
    try {
      const token = await _data.read('tokens', id).catch(e => {
        throw new Error('Token not found')
      })
      await _data.delete('tokens', id).catch(e => {
        throw new Error('Could not delete specified token')
      })
      callback(200)
    } catch (error) {
      callback(404, { error: error.message, originalError: error })
    }

  },
}

// The tokens handler
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
