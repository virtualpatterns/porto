import RESTErrors from 'restify-errors'
import { Process } from 'mablung'

import Package from '../../package.json'

const Status = Object.create({})

Status.createRoutes = function(server, options) {

  server.head('/api/status', function(request, response, next) {
    response.send(200)
    return next()
  })

  server.get('/api/status', function(request, response, next) {

    var memory = Process.memoryUsage()

    var status = {
      'name': Package.name,
      'now': new Date().toISOString(),
      'version': Package.version,
      'heap': {
        'total': memory.heapTotal,
        'used': memory.heapUsed
      }
    }

    response.send(status)
    return next()

  })

  server.head('/api/error', function(request, response, next) {
    return next(new RESTErrors.InternalServerError('server.head(\'/api/error\', function(request, response, next) { ... })'))
  })

  // server.head('/api/crash', function(request, response, next) {
  //   throw new Error('server.head(\'/api/crash\', function(request, response, next) { ... })')
  // })

}

export default Status
