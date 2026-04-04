'use strict'
const { createServer } = require('http')
const { parse }        = require('url')
const next             = require('next')
const httpProxy        = require('http-proxy')

const port = parseInt(process.env.PORT  ?? '3001', 10)
const api  = process.env.API_URL ?? 'http://localhost:4001'
const dev  = process.env.NODE_ENV !== 'production'

const app   = next({ dev })
const proxy = httpProxy.createProxyServer({ target: api, ws: true })

proxy.on('error', (err, req, res) => {
  console.error('[ws-proxy] error proxying to API:', err.message, err.code ?? '')
  try { if (res?.end) res.end() } catch {}
})

app.prepare().then(() => {
  const handle = app.getRequestHandler()

  const server = createServer((req, res) => handle(req, res, parse(req.url, true)))

  server.on('upgrade', (req, socket, head) => {
    console.log(`[ws-proxy] upgrade received: ${req.url} → ${api}`)
    socket.on('error', err => console.error('[ws-proxy] socket error:', err.message))
    proxy.ws(req, socket, head, {}, (err) => {
      if (err) console.error('[ws-proxy] proxy.ws callback error:', err.message)
    })
  })

  server.listen(port, () => console.log(`[web] ready on port ${port}  api=${api}`))
})
