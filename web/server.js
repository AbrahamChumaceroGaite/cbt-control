'use strict'
const { createServer } = require('http')
const { parse }        = require('url')
const next             = require('next')
const httpProxy        = require('http-proxy')

const port  = parseInt(process.env.PORT  ?? '3001', 10)
const api   = process.env.API_URL ?? 'http://localhost:4001'
const dev   = process.env.NODE_ENV !== 'production'

const app   = next({ dev })
const proxy = httpProxy.createProxyServer({ target: api, ws: true })

app.prepare().then(() => {
  const handle = app.getRequestHandler()

  createServer((req, res) => handle(req, res, parse(req.url, true)))
    .on('upgrade', (req, socket, head) => proxy.ws(req, socket, head))
    .listen(port, () => console.log(`> Web ready on port ${port}`))
})
