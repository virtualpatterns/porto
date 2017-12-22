import { Log, Path } from 'mablung'
import RESTPlugins from 'restify-plugins'
import REST from 'restify'

import Package from '../package.json'

const REGEXP_ALL = /^(.*)$/
const STOP_TIMEOUT = 5000

const Server = Object.create({})

Server.start = function (address, port, staticPath) {
  Log.debug(`- Server.start('${address}', ${port}, '${Path.trim(staticPath)}')`)

  return new Promise(async (resolve, reject) => {

    try {

      this.server = REST.createServer({
        'name': `${Package.name} v${Package.version}`
      })

      this.server.use((request, response, next) => {
        Log.debug(`- ${request.method} ${request.url}`)
        return next()
      })

      this.server.head('/', (request, response, next) => {
        response.send(200, {})
        next()
      })

      this.server.get('/', (request, response, next) => {
        response.redirect('/index.html', next)
      })

      this.server.head(REGEXP_ALL, (request, response, next) => {
        response.send(200, {})
        next()
      })

      this.server.get(REGEXP_ALL, (request, response, next) => {
        RESTPlugins.serveStatic({
          'directory': staticPath,
          'file': request.params[0],
          'maxAge': 0
        })(request, response, next)
      })

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
        setTimeout(() => resolve(), STOP_TIMEOUT)
      })

    }
    catch (error) {
      reject(error)
    }

  })

}

export default Server
