import 'babel-polyfill'
import Jake from 'jake'
// import { Log, Path } from 'mablung'
import { Log } from 'mablung'

// import Server from '../server/server'

Jake.addListener('start', () => {
  Log.addConsole()
  Log.debug('> Start')
})

Jake.addListener('complete', () => {
  Log.debug('< Finished')
  Log.removeConsole()
})

desc('Remove built and bundled folders/files')
task('clean', [], {}, () => {

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
  Jake.exec([ 'webpack' ], { 'printStderr': true, 'printStdout': true }, () => complete())
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

  // await Server.start(
  //   '0.0.0.0',
  //   8080,
  //   Path.join(__dirname, '../www'),
  //   Path.join(__dirname, '../node_modules'),
  //   'mysql://porto:porto@localhost/porto')
  //
  // Jake.exec([ 'wget --directory-prefix=deployment/s3 --mirror --no-verbose http://localhost:8080/favicon.ico http://localhost:8080/www/index.html http://localhost:8080/www/configurations/default.json http://localhost:8080/www/configurations/static.json http://localhost:8080/www/configuration.json' ], { 'printStderr': true, 'printStdout': true }, async () => {
  //   await Server.stop()
  //   complete()
  // })

  let serverStart = Jake.Task['server:start']

  serverStart.addListener('error', (error) => Log.inspect('error', error))
  serverStart.addListener('complete', () => {

    Log.debug('- Generating ...')

    let wget = Jake.createExec([ 'wget --directory-prefix=deployment/s3 --cut-dirs=1 --execute robots=off --mirror --no-host-directories --no-verbose --quiet http://localhost:8080/favicon.ico http://localhost:8080/www/index.html http://localhost:8080/www/configurations/default.json http://localhost:8080/www/configurations/static.json http://localhost:8080/www/configuration.json' ])
    wget.addListener('stdout', (data) => {
      Log.debug(`- ${data}`)
    })
    wget.addListener('stderr', (data) => {
      Log.error(`- ${data}`)
    })
    wget.addListener('error', (message, code) => {

      Log.error(`- ${message} (${code})`)

      let serverStop = Jake.Task['server:stop']

      serverStop.addListener('error', (error) => Log.inspect('error', error))
      serverStop.addListener('complete', () => complete())

      serverStop.invoke()

    })
    wget.addListener('cmdEnd', () => {

      let serverStop = Jake.Task['server:stop']

      serverStop.addListener('error', (error) => Log.inspect('error', error))
      serverStop.addListener('complete', () => complete())

      serverStop.invoke()

    })

    wget.run()

  })

  serverStart.invoke()

})

desc('Test the server and client')
task('test', [ 'generate', 'lint' ], { 'async': true }, () => {
  Log.debug('- Testing ...')
  Jake.rmRf('/var/log/porto/porto.test.log', { 'silent': true })
  Jake.exec([ 'env ADDRESS="0.0.0.0" DATABASE_URL="mysql://porto:porto@localhost/porto?multipleStatements=true" LOG_PATH="/var/log/porto/porto.test.log" MODULES_PATH="./node_modules" PORT="8080" STATIC_PATH="./www:./deployment/s3" istanbul cover ./node_modules/.bin/_mocha --dir ./coverage -- --bail --recursive --timeout 0 ./tests' ], { 'printStderr': true, 'printStdout': true }, () => complete())
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
