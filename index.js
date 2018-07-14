const http = require("http")
const url = require("url")

const port = 3000

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

  // Send the response
  res.end("Hello World!\n")

  // Log the request path
  console.log(method, headers, '"' + trimmedPath + '"', queryStringObject)
})

// Start listen on 3000
server.listen(port, () => {
  console.log("Listening on 3000")
})
