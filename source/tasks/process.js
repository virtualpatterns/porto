import 'babel-polyfill'
import Jake from 'jake'
import { Log } from 'mablung'

namespace('server', () => {

  desc('Run server')
  task('run', [ 'bundle' ], { 'async': true }, () => {
    Jake.exec([ 'node ./server/index.js run'], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

  desc('Start server')
  task('start', [ 'bundle' ], { 'async': true }, () => {
    Jake.exec([ 'pm2 start node --name porto-server-8080 --silent -- ./server/index.js run --logPath /var/log/porto/porto-server-8080.log' ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

  desc('Stop server')
  task('stop', [], { 'async': true }, () => {
    Jake.exec([
      'pm2 stop porto-server-8080 --silent',
      'pm2 delete porto-server-8080 --silent'
    ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

})

namespace('s3', () => {

  desc('Run S3 server')
  task('run', [ 'generate' ], { 'async': true }, () => {

    const Server = require('../server/server')

    let server = Server.createServer()

    server.start()
      .then(() => {

        Jake.cpR('./deployment/s3/configurations/localhost.json', './deployment/s3/configuration.json', { 'silent': true })

        let s3 = Jake.createExec([ 'node ./server/index.js run --port 8081 --staticPath ./deployment/s3 --s3' ], { 'printStderr': true, 'printStdout': true })
        s3.addListener('error', (message, code) => {
          Log.error(`- ${message} (${code})`)
          server.stop()
            .then(() => Jake.cpR('./deployment/s3/configurations/default.json', './deployment/s3/configuration.json', { 'silent': true }))
            .then(() => complete())
        })
        s3.addListener('cmdEnd', () => {
          server.stop()
            .then(() => Jake.cpR('./deployment/s3/configurations/default.json', './deployment/s3/configuration.json', { 'silent': true }))
            .then(() => complete())
        })

        s3.run()

      })
      .catch((error) => {
        Log.error('- Server.start()')
        Log.error(`-   error.message='${error.message}'`)
        Log.error(`-   error.stack ...\n\n${error.stack}\n`)
        complete()
      })

  })

})

namespace('haproxy', () => {

  desc('Run HAProxy')
  task('run', [], { 'async': true }, () => {
    Jake.exec([ 'sudo haproxy -d -f ./deployment/haproxy.cfg' ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

  desc('Start HAProxy')
  task('start', [], { 'async': true }, () => {
    Log.debug('- Starting ...')
    Jake.exec([ 'sudo haproxy -D -f ./deployment/haproxy.cfg' ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

  desc('Stop HAProxy')
  task('stop', [], { 'async': true }, () => {
    Log.debug('- Stopping ...')
    Jake.exec([ 'sudo kill $(cat /var/run/haproxy.pid)' ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

})
