const http = require('http')
const https = require('https')
const url = require('url')
const fs = require('fs')
const { StringDecoder } = require('string_decoder')

const handlers = require('./lib/handlers')
const helpers = require('./lib/helpers')

const config = require('./lib/config')

const httpPort = config.httpPort
const httpsPort = config.httpsPort

// Define a request router
const router = handlers

// All thes server logic for both http and https
const unifiedServer = (req, res) => {
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
        payload: helpers.parseJsonToObject(buffer),
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
}

// Instantiate HTTP server
const httpServer = http.createServer(unifiedServer)

// Start listen on 3000
httpServer.listen(httpPort, () => {
  console.log("Listening on", httpPort)
})

const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem'),
} 

// Instantiate HTTPS server
const httpsServer = https.createServer(httpsServerOptions, unifiedServer)

httpsServer.listen(httpsPort, () => {
  console.log('Listening on', httpsPort)
})
