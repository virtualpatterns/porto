import 'babel-polyfill'
import Jake from 'jake'
import { Log } from 'mablung'

import Server from '../server/server'

Jake.addListener('start', () => {
  Log.addConsole()
})

Jake.addListener('complete', () => {
  Log.debug('- Done')
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

  Server.start(
    '127.0.0.1',
    8080,
    './www',
    './node_modules',
    'mysql://porto:porto@127.0.0.1/porto')
    .then(() => {

      let wget = Jake.createExec([ 'wget --directory-prefix=deployment/s3 --cut-dirs=1 --execute robots=off --mirror --no-host-directories --no-verbose --quiet http://127.0.0.1:8080/favicon.ico http://127.0.0.1:8080/www/index.html http://127.0.0.1:8080/www/configurations/default.json http://127.0.0.1:8080/www/configurations/static.json http://127.0.0.1:8080/www/configuration.json' ], { 'printStderr': true, 'printStdout': true })
      wget.addListener('error', (message, code) => {
        Log.error(`- ${message} (${code})`)
        Server.stop()
          .then(() => complete())
      })
      wget.addListener('cmdEnd', () => {
        Server.stop()
          .then(() => complete())
      })

      wget.run()

    })

})

desc('Test the server and client')
task('test', [ 'lint', 'generate' ], { 'async': true }, () => {
  Log.debug('- Testing ...')

  Server.start(
    '127.0.0.1',
    8080,
    './www',
    './node_modules',
    'mysql://porto:porto@127.0.0.1/porto')
    .then(() => {

      let mocha = Jake.createExec([ 'env DATABASE_URL="mysql://porto:porto@localhost/porto" URL="http://127.0.0.1:8080" istanbul cover ./node_modules/.bin/_mocha --dir ./coverage -- --bail --recursive --timeout 0 ./tests' ], { 'printStderr': true, 'printStdout': true })
      mocha.addListener('error', (message, code) => {
        Log.error(`- ${message} (${code})`)
        Server.stop()
          .then(() => complete())
      })
      mocha.addListener('cmdEnd', () => {
        Server.stop()
          .then(() => complete())
      })

      mocha.run()

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
