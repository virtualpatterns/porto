import Jake from 'jake'
import { Log } from 'mablung'

const LOG_PATH = '/var/log/porto/porto-tasks.log'

Jake.addListener('start', () => {
  Jake.rmRf(LOG_PATH, { 'silent': true })
  Log.addFile(LOG_PATH)
})

Jake.addListener('complete', () => {
  Log.debug('- Done')
  Log.removeFile(LOG_PATH)
})

desc('Remove built and bundled folders/files')
task('clean', [], {}, () => {
  Log.debug('- Cleaning ...')

  Jake.rmRf('deployment/s3', { 'silent': true })
  Jake.mkdirP('deployment/s3', { 'silent': true })
  Jake.rmRf('library', { 'silent': true })
  Jake.rmRf('sandbox', { 'silent': true })
  Jake.rmRf('server', { 'silent': true })
  Jake.rmRf('tests', { 'silent': true })
  Jake.rmRf('webpack.config.js', { 'silent': true })
  Jake.rmRf('www', { 'silent': true })

})

desc('Build files')
task('build', [ 'clean' ], { 'async': true }, () => {
  Log.debug('- Building ...')
  Jake.exec([ 'babel ./source --copy-files --out-dir . --quiet --source-maps inline' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

desc('Bundle files')
task('bundle', [ 'build' ], { 'async': true }, () => {
  Log.debug('- Bundling ...')
  Jake.exec([ 'webpack' ], { 'printStderr': true, 'printStdout': false }, () => complete())
})

desc('Lint files')
task('lint', [ 'bundle' ], { 'async': true }, () => {
  Log.debug('- Linting ...')
  Jake.exec([ 'eslint --ignore-path .gitignore ./source' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

require('./configuration')
require('./process')
require('./http')

desc('Generate the static site')
task('generate', [ 'bundle' ], { 'async': true }, () => {
  Log.debug('- Generating ...')

  const Server = require('../server/server')

  let server = Server.createServer()

  server.start()
    .then(() => {

      let wget = Jake.createExec([ 'wget --directory-prefix=deployment/s3 --cut-dirs=1 --execute robots=off --mirror --no-host-directories --no-verbose --quiet http://localhost:8080/favicon.ico http://localhost:8080/www/index.html http://localhost:8080/www/configurations/default.json http://localhost:8080/www/configurations/localhost.json http://localhost:8080/www/configurations/static.json http://localhost:8080/www/configuration.json' ], { 'printStderr': true, 'printStdout': true })
      wget.addListener('error', (message, code) => {
        Log.error(`- ${message} (${code})`)
        server.stop()
          .then(() => complete())
      })
      wget.addListener('cmdEnd', () => {
        server.stop()
          .then(() => complete())
      })

      wget.run()

    })
    .catch((error) => {
      Log.error('- Server.start()')
      Log.error(`-   error.message='${error.message}'`)
      Log.error(`-   error.stack ...\n\n${error.stack}\n`)
      complete()
    })

})

desc('Test the server and client')
task('test', [ 'lint', 'generate' ], { 'async': true }, () => {
  Log.debug('- Testing ...')

  const Server = require('../server/server')

  let server = Server.createServer()

  server.start()
    .then(() => {

      Jake.cpR('./deployment/s3/configurations/localhost.json', './deployment/s3/configuration.json', { 'silent': true })

      let s3 = Server.createServer({ 'port': 8081, 'staticPath': './deployment/s3'})

      s3.start()
        .then(() => {

          Jake.rmRf('/var/log/porto/porto-tests.log', { 'silent': true })

          let mocha = Jake.createExec([ 'env DATABASE_URL="mysql://porto:porto@localhost/porto?multipleStatements=true" SERVER_URL="http://localhost:8080/" S3_URL="http://localhost:8081/" mocha --bail --recursive --timeout 0 ./tests' ], { 'printStderr': true, 'printStdout': true })
          mocha.addListener('error', (message, code) => {
            Log.error(`- ${message} (${code})`)

            s3.stop()
              .then(() => server.stop())
              .then(() => Jake.cpR('./deployment/s3/configurations/default.json', './deployment/s3/configuration.json', { 'silent': true }))
              .then(() => complete())

          })
          mocha.addListener('cmdEnd', () => {
            s3.stop()
              .then(() => server.stop())
              .then(() => Jake.cpR('./deployment/s3/configurations/default.json', './deployment/s3/configuration.json', { 'silent': true }))
              .then(() => complete())
          })

          mocha.run()

        })
        .catch((error) => {
          Log.error('- Server.start()')
          Log.error(`-   error.message='${error.message}'`)
          Log.error(`-   error.stack ...\n\n${error.stack}\n`)

          server.stop()
            .then(() => complete())

        })

    })
    .catch((error) => {
      Log.error('- Server.start()')
      Log.error(`-   error.message='${error.message}'`)
      Log.error(`-   error.stack ...\n\n${error.stack}\n`)
      complete()
    })

})

desc('Publish package')
task('publish', [ 'configuration:default', 'test' ], { 'async': true }, () => {
  Jake.exec([
    'npm publish --access public',
    'npm --no-git-tag-version version patch',
    'git add package.json',
    'git commit --message="Increment version"'
  ], { 'printStderr': true, 'printStdout': true }, () => complete())
})
