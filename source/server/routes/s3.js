import RESTPlugins from 'restify-plugins'

const REGEXP_ALL = /^(.*)$/

const S3 = Object.create({})

S3.createRoutes = async function(_server, staticPath) {

  _server.head('/', (request, response, next) => {
    response.send(200, {})
    next()
  })

  _server.get('/', (request, response, next) => {
    response.redirect('/index.html', next)
  })

  _server.head(REGEXP_ALL, (request, response, next) => {
    response.send(200, {})
    next()
  })

  _server.get(REGEXP_ALL, (request, response, next) => {
    RESTPlugins.serveStatic({
      'directory': staticPath,
      'file': request.params[0],
      'maxAge': 0
    })(request, response, next)
  })

}

export default S3
