import Is from '@pwn/is'
import { Log, Path } from 'mablung'
import RESTPlugins from 'restify-plugins'
import REST from 'restify'

import Attendance from './routes/attendance'
import Package from '../package.json'
import Static from './routes/static'
import Status from './routes/status'

const STOP_TIMEOUT = 5000

const Server = Object.create({})

Server.start = function (address, port, staticPath, modulesPath, databaseUrl) {
  Log.debug(`- Server.start('${address}', ${port}, '${Path.trim(staticPath)}', '${Path.trim(modulesPath)}', '${databaseUrl}')`)

  return new Promise(async (resolve, reject) => {

    try {

      this.server = REST.createServer({
        'name': `${Package.name} v${Package.version}`
      })

      this.server.on('restifyError', (request, response, error, callback) => {
        Log.error('- server.on(\'restifyError\', function(request, response, error, callback) { ... })')
        Log.error(`-   error.message='${error.message}'`)
        Log.error(`-   error.stack ...\n\n${error.stack}\n`)
        // response.send(error)
        return callback()
      })

      this.server.pre(RESTPlugins.pre.userAgentConnection())

      this.server.use(RESTPlugins.queryParser({
        // 'mapParams': true
      }))

      this.server.use(RESTPlugins.bodyParser({
        // 'mapParams': true
      }))

      this.server.use((request, response, next) => {
        Log.debug(`- ${request.method} ${request.url} ${request.header('X-Forwarded-For') || request.socket.remoteAddress} ${request.header('User-Agent')}`)
        if (request.query && !Is.emptyObject(request.query)) Log.inspect('  request.query', request.query)
        if (request.body && !Is.emptyObject(request.body)) Log.inspect('  request.body', request.body)

        // response.header('Access-Control-Allow-Origin', '*')
        // response.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        // response.header('Access-Control-Allow-Headers', 'Content-Type')

        return next()

      })

      Attendance.createRoutes(this.server, databaseUrl)
      Static.createRoutes(this.server, staticPath, modulesPath)
      Status.createRoutes(this.server, databaseUrl)

      this.server.listen(port, address, () => {
        resolve()
      })

    }
    catch (error) {
      reject(error)
    }

  })

}

Server.stop = function () {
  Log.debug('- Server.stop()')

  return new Promise((resolve, reject) => {

    try {

      this.server.close(() => {
        // Log.debug('- this.server.close()')
        setTimeout(() => resolve(), STOP_TIMEOUT)
      })

    }
    catch (error) {
      reject(error)
    }

  })

}

export default Server