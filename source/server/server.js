import Is from '@pwn/is'
import { Log, Path, Process } from 'mablung'
import RESTPlugins from 'restify-plugins'
import REST from 'restify'
import Utilities from 'util'

import Attendance from './routes/attendance'
import Package from '../package.json'
import Static from './routes/static'
import Status from './routes/status'

const Server = Object.create({})

Server.start = async function (address, port, staticPath, databaseUrl) {
  Log.debug(`- Server.start('${address}', ${port}, '${Path.trim(staticPath)}', '${databaseUrl}')`)

  return new Promise((resolve, reject) => {

    try {

      this.server = REST.createServer({
        'name': `${Package.name} v${Package.version}`
      })

      this.server.on('restifyError', (request, response, error, callback) => {
        Log.error('- server.on(\'restifyError\', function(request, response, error, callback) { ... })')
        Log.error(`    error.message='${error.message}'`)
        Log.error(`    error.stack ...\n\n${error.stack}\n`)
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
        Log.debug(`- ${request.method} ${request.url}`)
        if (request.query && !Is.emptyObject(request.query)) Log.debug(`-   request.query ...\n\n${Utilities.inspect(request.query)}\n`)
        if (request.body && !Is.emptyObject(request.body)) Log.debug(`-   request.body ...\n\n${Utilities.inspect(request.body)}\n`)
        return next()
      })

      Attendance.createRoutes(this.server, databaseUrl)
      Static.createRoutes(this.server, staticPath)
      Status.createRoutes(this.server)

      this.server.listen(port, address, () => {
        // Log.debug(`- this.server.listen(${port}, '${address}', () => { ... })`)
        resolve()
      })

    }
    catch (error) {
      reject(error)
    }

  })

}

Server.stop = async function () {
  Log.debug('- Server.stop()')

  return new Promise((resolve, reject) => {

    try {

      this.server.close(() => {
        // Log.debug('- this.server.close()')
        resolve()
      })

    }
    catch (error) {
      reject(error)
    }

  })

}

export default Server
