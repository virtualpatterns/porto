import 'babel-polyfill'
import Jake from 'jake'
import { Log } from 'mablung'

Jake.addListener('start', () => {
  Log.addConsole()
  Log.debug('> Start')
})

Jake.addListener('complete', () => {
  Log.debug('< Complete')
  Log.removeConsole()
})

desc('Remove built folders/files')
task('clean', [], {}, () => {

  Jake.rmRf('library', { 'silent': true })
  Jake.rmRf('sandbox', { 'silent': true })
  Jake.rmRf('server', { 'silent': true })
  Jake.rmRf('tests', { 'silent': true })
  Jake.rmRf('webpack.config.js', { 'silent': true })
  Jake.rmRf('www', { 'silent': true })

})

desc('Build folders/files')
task('build', [ 'clean' ], { 'async': true }, () => {
  Log.debug('- Building ...')
  Jake.exec([ 'babel ./source --copy-files --out-dir . --quiet --source-maps inline' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

desc('Bundle folders/files')
task('bundle', [ 'build' ], { 'async': true }, () => {
  Log.debug('- Bundling ...')
  Jake.exec([ 'webpack' ], { 'printStderr': true, 'printStdout': false }, () => complete())
})

desc('Lint folders/files')
task('lint', [ 'bundle' ], { 'async': true }, () => {
  Log.debug('- Linting ...')
  Jake.exec([ 'eslint --ignore-path .gitignore ./source' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

desc('Run server')
task('run', [ 'bundle' ], { 'async': true }, () => {
  Jake.exec([ 'node ./server/index.js run --databaseUrl mysql://porto:porto@localhost/porto --logPath /var/log/porto/porto.log' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

desc('Test the server and client')
task('test', [ 'lint' ], { 'async': true }, () => {
  Log.debug('- Testing ...')
  Jake.rmRf('/var/log/porto/porto.test.log', { 'silent': true })
  Jake.exec([ 'env ADDRESS="0.0.0.0" DATABASE_URL="mysql://porto:porto@localhost/porto?multipleStatements=true" LOG_PATH="/var/log/porto/porto.test.log" MODULES_PATH="./node_modules" PORT="8080" STATIC_PATH="./www" istanbul cover ./node_modules/.bin/_mocha --dir ./source/www/coverage -- --bail --recursive --timeout 0 ./tests' ], { 'printStderr': true, 'printStdout': true }, () => complete())
})

desc('Publish')
task('publish', [ 'test' ], { 'async': true }, () => {
  Jake.exec([
    'npm publish --access public',
    'npm --no-git-tag-version version patch',
    'git add package.json',
    'git commit --message="Increment version"'
  ], { 'printStderr': true, 'printStdout': true }, () => complete())
})
