import Format from 'human-format'
import { Log, Process } from 'mablung'

import RESTErrors from 'restify-errors'

import Database from '../database'
import Package from '../../package.json'

const Status = Object.create({})

Status.createRoutes = function (_server, databaseUrl) {

  _server.head('/api/status', (request, response, next) => {
    response.send(200, {})
    return next()
  })

  _server.get('/api/status', async (request, response, next) => {

    try {

      let connection = await Database.open(databaseUrl)

      try {

        let database = await connection.getDatabase()
        let tables = await connection.getTables()

        let memory = Process.memoryUsage()

        let status = {
          'address': {
            'remote': request.socket.remoteAddress,
            'forwarded': request.header('X-Forwarded-For') || '(none)'
          },
          'agent': request.header('User-Agent') || '(none)',
          'database': {
            'name': database.name,
            'description': database.description,
            'size': Status.formatSize(database.numberOfBytes),
            'tables': [],
            'version': database.version
          },
          'heap': {
            'total': Status.formatSize(memory.heapTotal),
            'used': Status.formatSize(memory.heapUsed)
          },
          'now': new Date().toISOString(),
          'package': {
            'name': Package.name,
            'version': Package.version
          }
        }

        for (let table of tables) {

          status.database.tables.push({
            'name': table.name,
            'rows': table.numberOfRows,
            'size': Status.formatSize(table.numberOfBytes)
          })

        }

        response.send(status)
        return next()

      }
      finally {
        await connection.close()
      }

    }
    catch (error) {

      Log.error('- _server.get(\'/api/status\', (request, response, next) => { ... })')
      Log.error(`-   error.message='${error.message}'`)
      Log.error(`-   error.stack ...\n\n${error.stack}\n`)

      return next(new RESTErrors.InternalServerError())

    }

  })

}

Status.formatSize = function (size) {
  return Format(size, {
    'scale': 'binary',
    'unit': 'B'
  })
}

export default Status
