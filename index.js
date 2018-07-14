const http = require('http')

const port = 3000

// Respond to all request with a string
const server = http.createServer((req, res) => (
    res.end('Hello World!\n')
))

// Start listen on 3000
server.listen(port, () => {
    console.log('Listening on 3000')
})