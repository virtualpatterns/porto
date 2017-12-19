import 'babel-polyfill'
import Jake from 'jake'
import { Log } from 'mablung'

namespace('server', () => {

  desc('Run server')
  task('run', [ 'bundle' ], { 'async': true }, () => {
    Jake.exec([ 'node ./server/index.js run --databaseUrl mysql://porto:porto@localhost/porto' ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

  desc('Start server')
  task('start', [ 'bundle' ], { 'async': true }, () => {
    Log.debug('- Starting server ...')
    Jake.exec([ 'pm2 start node --name porto-server-8080 --silent -- ./server/index.js run --databaseUrl mysql://porto:porto@localhost/porto --logPath /var/log/porto/porto-server-8080.log' ], { 'printStderr': true, 'printStdout': true }, () => setTimeout(() => complete(), 5000))
  })

  desc('Stop server')
  task('stop', [], { 'async': true }, () => {
    Log.debug('- Stopping server ...')
    Jake.exec([
      'pm2 stop porto-server-8080 --silent',
      'pm2 delete porto-server-8080 --silent'
    ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

  desc('Show the server log')
  task('log', [], { 'async': true }, () => {
    Jake.exec([
      'clear',
      'tail -f /var/log/porto/porto-server-8080.log'
    ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

})

namespace('s3', () => {

  desc('Run server')
  task('run', [ 'generate' ], { 'async': true }, () => {
    Jake.exec([ 'node ./server/index.js run --databaseUrl mysql://porto:porto@localhost/porto --staticPath ./deployment/s3' ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

  desc('Start server')
  task('start', [ 'bundle' ], { 'async': true }, () => {
    Log.debug('- Starting server (S3...')
    Jake.exec([ 'pm2 start node --name porto-s3-8080 --silent -- ./server/index.js run --databaseUrl mysql://porto:porto@localhost/porto --logPath /var/log/porto/porto-s3-8080.log  --staticPath ./deployment/s3' ], { 'printStderr': true, 'printStdout': true }, () => setTimeout(() => complete(), 5000))
  })

  desc('Stop server')
  task('stop', [], { 'async': true }, () => {
    Log.debug('- Stopping server (S3) ...')
    Jake.exec([
      'pm2 stop porto-s3-8080 --silent',
      'pm2 delete porto-s3-8080 --silent'
    ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

  desc('Show the server log')
  task('log', [], { 'async': true }, () => {
    Jake.exec([
      'clear',
      'tail -f /var/log/porto/porto-s3-8080.log'
    ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

})

namespace('proxy', () => {

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

  desc('Show the HAProxy log')
  task('log', [], { 'async': true }, () => {
    Jake.exec([
      'clear',
      'tail -f /var/log/haproxy/haproxy.log'
    ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

})
