/*
 * Request handlers
 */
const _data = require('./data')
const helpers = require('./helpers')

// Ping handler
const ping = (data, callback) => {
  // Callback a http status code, and a payload object
  callback(200)
}

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
      callback(400, {Error: 'Missing required fields'})
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
  delete (data, callback) {
  },
  put (data, callback) {
  },
  async get (data, callback) {
    const phone = data.queryStringObject.phone
    if (!phone) {
      callback(400, { error: 'Missing required parameter: phone'})
    }
    try {
      const user = await _data.read('users', phone)
      // To be safe, do not send the password
      delete user.password
      callback(200, user)
    } catch(error) {
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

const notFound = (data, callback) => {
  // Callback a http status code, and no payload object
  callback(404)
}

module.exports = {
  ping,
  notFound,
  users,
}