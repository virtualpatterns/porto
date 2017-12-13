import RESTErrors from 'restify-errors'
import { Process } from 'mablung'

import Package from '../../package.json'

const Status = Object.create({})

Status.createRoutes = function (server) {

  server.head('/api/status', (request, response, next) => {
    response.send(200, {})
    return next()
  })

  server.get('/api/status', (request, response, next) => {

    let memory = Process.memoryUsage()

    let status = {
      'address': {
        'remote': request.socket.remoteAddress,
        'forwarded': request.header('X-Forwarded-For') || '(none)'
      },
      'agent': request.header('User-Agent') || '(none)',
      'heap': {
        'total': memory.heapTotal,
        'used': memory.heapUsed
      },
      'name': Package.name,
      'now': new Date().toISOString(),
      'version': Package.version
    }

    response.send(status)
    return next()

  })

  server.head('/api/error', (request, response, next) => {
    return next(new RESTErrors.InternalServerError('server.head(\'/api/error\', (request, response, next) => { ... })'))
  })

}

export default Status
