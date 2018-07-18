const _data = require('../data')
const helpers = require('../helpers')

// Users handlers
const _users = {
  // Required data: firstName, lastName, phone, password, tosAgreement
  post (data, callback) {
    // Check all required data is there
    const {
      firstName,
      lastName,
      phone,
      password,
      tosAgreement,
    } = data.payload

    // Return a 400 status if not
    if (!firstName || !lastName || !(phone && phone.length === 10) || !password || !tosAgreement) {
      callback(400, { error: 'Missing required fields' })
      return
    }

    // Return a 400 if 
    const hashedPassword = helpers.hash(password)
    if (!hashedPassword) {
      callback(400, {Error: 'Invalid password'})
      return
    }
    
    // Create the user object
    const user = {
      firstName,
      lastName,
      phone,
      password: helpers.hash(password),
      tosAgreement: true,
    }

    // Create the json file with the phone as the name
    _data.create('users', phone, user)
      .then(() => callback(201))
      .catch(() => callback(409, { error: 'User already exists' }))
  },
  async delete (data, callback) {
    const phone = data.queryStringObject.phone
    if (!phone) {
      callback(400, { error: 'Missing required parameter: phone'})
      return
    }
    try {
      const user = await _data.read('users', phone).catch(e => {
        throw new Error('User not found')
      })
      await _data.delete('users', phone).catch(e => {
        throw new Error('Could not delete specified user')
      })
      callback(200)
    } catch (error) {
      callback(404, { error: error.message, originalError: error })
    }
  },
  async put (data, callback) {
    // Check all required data is there
    const {
      firstName,
      lastName,
      phone,
      password,
      tosAgreement,
    } = data.payload

    // Return a 400 status if not
    if (!(phone && phone.length === 10) || (!firstName && !lastName && !password && !tosAgreement)) {
      callback(400, { error: 'Missing required fields' })
      return
    }
    let user
    try {
      user = await _data.read('users', phone)
    } catch (error) {
      callback(400, { error: 'The specified user does not exist' })
      return
    }

    if (firstName) {
      user.firstName = firstName
    }
    if (lastName) {
      user.lastName = lastName
    }
    if (password) {
      user.password = helpers.hash(password)
    }

    try {
      _data.update('users', phone, user)
      callback(200)
    } catch (error) {
      callback(500, { error: 'Unable to update user' })
    }
    
  },
  async get (data, callback) {
    const phone = data.queryStringObject.phone
    if (!phone) {
      callback(400, { error: 'Missing required parameter: phone'})
      return
    }
    try {
      const user = await _data.read('users', phone)
      // To be safe, do not send the password
      delete user.password
      callback(200, user)
    } catch (error) {
      callback(404, { error: 'User not found', originalError: error })
    }
  },
}

// The main users handler
const users = (data, callback) => {
  // Acceptable methods
  const acceptableMethods = ['post', 'put', 'get', 'delete']
  if (!acceptableMethods.includes(data.method)) {
    callback(405)
  }

  // Use the appropriate handler
  _users[data.method](data, callback)
}

module.exports = users
