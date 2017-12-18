import { FileSystem, Log, Path } from 'mablung'
import RESTPlugins from 'restify-plugins'

const Static = Object.create({})

const REGEXP_MATERIAL = /^\/www\/vendor\/material\/(.*)$/
// const REGEXP_MOCHA = /^\/www\/vendor\/mocha\/(.*)$/
const REGEXP_STATIC = /^\/www\/(.*)$/

Static.createRoutes = async function(server, staticPath, modulesPath) {

  server.head('/favicon.ico', (request, response, next) => {
    response.send(200, {})
    return next()
  })

  try {

    Log.debug(`- FileSystem.accessSync('${Path.join(staticPath, 'favicon.ico')}', FileSystem.F_OK)`)

    FileSystem.accessSync(Path.join(staticPath, 'favicon.ico'), FileSystem.F_OK)

    server.get('/favicon.ico', (request, response, next) => {
      RESTPlugins.serveStatic({
        'directory': staticPath,
        'file': 'favicon.ico',
        'maxAge': 0
      })(request, response, next)
    })

  }
  catch (error) {

    Log.error(`    error.message='${error.message}'`)
    Log.error(`    error.stack ...\n\n${error.stack}\n`)

    server.get('/favicon.ico', (request, response, next) => {
      RESTPlugins.serveStatic({
        'directory': Path.join(staticPath, 'resources'),
        'file': 'application.ico',
        'maxAge': 0
      })(request, response, next)
    })

  }

  server.head('/', (request, response, next) => {
    response.send(200, {})
    return next()
  })

  server.get('/', (request, response, next) => {
    response.redirect('/www/index.html', next)
  })

  server.head('/www', (request, response, next) => {
    response.send(200, {})
    return next()
  })

  server.get('/www', (request, response, next) => {
    response.redirect('/www/index.html', next)
  })

  server.head(REGEXP_MATERIAL, (request, response, next) => {
    response.send(200, {})
    next()
  })

  try {

    Log.debug(`- FileSystem.accessSync('${Path.join(staticPath, 'vendor', 'material')}', FileSystem.F_OK)`)

    FileSystem.accessSync(Path.join(staticPath, 'vendor', 'material'), FileSystem.F_OK)

    server.get(REGEXP_MATERIAL, (request, response, next) => {
      RESTPlugins.serveStatic({
        'directory': Path.join(staticPath, 'vendor', 'material'),
        'file': request.params[0],
        'maxAge': 0
      })(request, response, next)
    })

  }
  catch (error) {

    Log.error(`    error.message='${error.message}'`)
    Log.error(`    error.stack ...\n\n${error.stack}\n`)

    server.get(REGEXP_MATERIAL, (request, response, next) => {
      RESTPlugins.serveStatic({
        'directory': Path.join(modulesPath, '@material'),
        'file': request.params[0],
        'maxAge': 0
      })(request, response, next)
    })

  }

  server.head(REGEXP_STATIC, (request, response, next) => {
    response.send(200, {})
    next()
  })

  server.get(REGEXP_STATIC, (request, response, next) => {
    RESTPlugins.serveStatic({
      'directory': staticPath,
      'file': request.params[0],
      'maxAge': 0
    })(request, response, next)
  })

}

export default Static
