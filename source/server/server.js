import _CORS from 'restify-cors-middleware'
import Is from '@pwn/is'
import { Log, Path } from 'mablung'
import RESTPlugins from 'restify-plugins'
import REST from 'restify'

import Attendance from './routes/attendance'
import Package from '../package.json'
import S3 from './routes/s3'
import Static from './routes/static'
import Status from './routes/status'

const CORS = _CORS({
  'preflightMaxAge': 5,
  'origins': [ '*' ],
  'allowHeaders': [ 'X-Forwarded-For' ],
  'exposeHeaders': [ '' ]
})

// const REGEXP_API = /^\/api\/(.*)$/
const STOP_TIMEOUT = 5000

const serverPrototype = Object.create({})

serverPrototype.start = function () {
  Log.debug('- Server.start()')

  return new Promise((resolve, reject) => {

    try {

      this._server.listen(this.port, this.address, () => {
        resolve()
      })

    }
    catch (error) {
      reject(error)
    }

  })

}

serverPrototype.stop = function () {
  Log.debug('- Server.stop()')

  return new Promise((resolve, reject) => {

    try {

      this._server.close(() => {
        setTimeout(() => resolve(), STOP_TIMEOUT)
      })

    }
    catch (error) {
      reject(error)
    }

  })

}

const Server = Object.create({})

Server.DEFAULT_ADDRESS = '0.0.0.0'
Server.DEFAULT_DATABASE_URL = 'mysql://porto:porto@localhost/porto'
Server.DEFAULT_MODULES_PATH = Path.join(__dirname, '../node_modules')
Server.DEFAULT_PORT = 8080
Server.DEFAULT_STATIC_PATH = Path.join(__dirname, '../www')

Server.createServer = function({ address = Server.DEFAULT_ADDRESS, databaseUrl = Server.DEFAULT_DATABASE_URL, port = Server.DEFAULT_PORT, modulesPath = Server.DEFAULT_MODULES_PATH, staticPath = Server.DEFAULT_STATIC_PATH, isS3 = false } = {}, prototype = serverPrototype) {
  Log.debug(`- Server.createServer({ '${address}', '${databaseUrl}', ${port}, '${Path.trim(modulesPath)}', '${Path.trim(staticPath)}', ${isS3} }, prototype)`)

  let _server = REST.createServer({
    'name': `${Package.name} v${Package.version}`
  })

  _server.on('restifyError', (request, response, error, callback) => {
    Log.error('- server.on(\'restifyError\', function(request, response, error, callback) { ... })')
    Log.error(`-   error.message='${error.message}'`)
    Log.error(`-   error.stack ...\n\n${error.stack}\n`)
    return callback()
  })

  _server.pre(RESTPlugins.pre.userAgentConnection())
  _server.pre(CORS.preflight)

  _server.use(RESTPlugins.queryParser({}))
  _server.use(RESTPlugins.bodyParser({}))
  _server.use(CORS.actual)
  _server.use((request, response, next) => {
    Log.debug(`- ${request.method} ${request.url} ${request.header('X-Forwarded-For', request.socket.remoteAddress)} ${request.header('User-Agent')}`)
    // if (request.headers && !Is.emptyObject(request.headers)) Log.inspect('  request.headers', request.headers)
    // if (request.query && !Is.emptyObject(request.query)) Log.inspect('  request.query', request.query)
    if (request.body && !Is.emptyObject(request.body)) Log.inspect('  request.body', request.body)

    // if (REGEXP_API.test(request.getPath())) {
    //   response.header('Access-Control-Allow-Origin', '*')
    //   response.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST')
    //   response.header('Access-Control-Allow-Headers', 'Content-Type')
    // }

    return next()

  })

  if (isS3) {
    S3.createRoutes(_server, staticPath)
  } else {

    Attendance.createRoutes(_server, databaseUrl)
    Static.createRoutes(_server, staticPath, modulesPath)
    Status.createRoutes(_server, databaseUrl)

  }

  let server = Object.create(prototype)

  server.address = address
  server.port = port
  server._server = _server

  return server

}

Server.isServer = function(server) {
  return serverPrototype.isPrototypeOf(server)
}

Server.getServerPrototype = function() {
  return serverPrototype
}

export default Server
