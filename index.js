const http = require('http')
const url = require('url')
const { StringDecoder } = require('string_decoder')

const port = 3000

// Define the handlers
const handlers = {}

// Sample handler

handlers.sample = (data, callback) => {
  // Callback a http status code, and a payload object
  callback(406, { name: 'sample handler'})
}

handlers.notFound = (data, callback) => {
  // Callback a http status code, and a payload object
  callback(404)
}

// Define a request router
const router = {
  sample: handlers.sample
}

// Respond to all request with a string
const server = http.createServer((req, res) => {
  // Get the URL and parse it
  const parsedUrl = url.parse(req.url, true)
  
  // Get the path
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, '')

  // Get the query string as an object
  const queryStringObject = parsedUrl.query

  // Get the method
  const method = req.method.toLowerCase()

  // Get the headers as an object
  const headers = req.headers

  // Get the payload (Comes as a stream)
  const decoder = new StringDecoder('utf-8')
  let buffer = ''
  req.on('data', (data) => {
    buffer += decoder.write(data)
  })

  req.on('end', () => {
    buffer += decoder.end()

    // Choose the appropriate handler
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined'
      ? router[trimmedPath]
      : handlers.notFound

    // Construct the data object
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer,
    }

    // Route the request to the chosen handler
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code called back by the handler
      statusCode = typeof(statusCode) === 'number'
        ? statusCode
        : 200

      // Use the payload called back by the handler, or default to {}
      const usedPayload = typeof(payload) === 'object' ? payload : {}

      // Convert the payload to a string
      const payloadString = JSON.stringify(usedPayload)
      
      // Send the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)

      // Log the request path
      console.log('Returning', statusCode, payloadString)
    })
  })

})

// Start listen on 3000
server.listen(port, () => {
  console.log("Listening on 3000")
})
