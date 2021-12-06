const Fs = require('fs')
const { createServer } = require('http')

const sockets = new Set()
const port = process.env.STATIC_SERVER_PORT || 3002

const server = createServer((req, res) => {
  Fs.readFile(__dirname + req.url, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end(JSON.stringify(err))
      return
    }

    res.writeHead(200)
    res.end(data)
  })
})

server.on('connection', socket => {
  sockets.add(socket)
  server.once('close', () => sockets.delete(socket))
})

server.on('error', console.error)

module.exports.start = function () {
  return server.listen(port)
}

module.exports.close = function (callback) {
  for (const socket of sockets) {
    socket.destroy()
    sockets.delete(socket)
  }

  server.close(callback)
}

exports.start()
