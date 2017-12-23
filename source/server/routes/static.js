import { Path } from 'mablung'
import RESTPlugins from 'restify-plugins'

const Static = Object.create({})

const REGEXP_MATERIAL = /^\/www\/vendor\/material\/(.*)$/
const REGEXP_STATIC = /^\/www\/(.*)$/

Static.createRoutes = async function(_server, staticPath, modulesPath) {

  _server.head('/favicon.ico', (request, response, next) => {
    response.send(200, {})
    return next()
  })

  _server.get('/favicon.ico', (request, response, next) => {
    RESTPlugins.serveStatic({
      'directory': Path.join(staticPath, 'resources'),
      'file': 'application.ico',
      'maxAge': 0
    })(request, response, next)
  })

  _server.head('/', (request, response, next) => {
    response.send(200, {})
    return next()
  })

  _server.get('/', (request, response, next) => {
    response.redirect('/www/index.html', next)
  })

  _server.head('/www', (request, response, next) => {
    response.send(200, {})
    return next()
  })

  _server.get('/www', (request, response, next) => {
    response.redirect('/www/index.html', next)
  })

  _server.head(REGEXP_MATERIAL, (request, response, next) => {
    response.send(200, {})
    next()
  })

  _server.get(REGEXP_MATERIAL, (request, response, next) => {
    RESTPlugins.serveStatic({
      'directory': Path.join(modulesPath, '@material'),
      'file': request.params[0],
      'maxAge': 0
    })(request, response, next)
  })

  _server.head(REGEXP_STATIC, (request, response, next) => {
    response.send(200, {})
    next()
  })

  _server.get(REGEXP_STATIC, (request, response, next) => {
    RESTPlugins.serveStatic({
      'directory': staticPath,
      'file': request.params[0],
      'maxAge': 0
    })(request, response, next)
  })

}

export default Static
