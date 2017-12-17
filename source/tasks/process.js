import 'babel-polyfill'
import Jake from 'jake'

namespace('server', () => {

  desc('Run server')
  task('run', [ 'bundle' ], { 'async': true }, () => {
    Jake.exec([ 'node ./server/index.js run --databaseUrl mysql://porto:porto@localhost/porto --port 8080' ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

  desc('Start server')
  task('start', [ 'bundle' ], { 'async': true }, () => {
    Jake.exec([ 'pm2 start node --name porto-server-8080 --silent -- ./server/index.js run --databaseUrl mysql://porto:porto@localhost/porto --logPath /var/log/porto/porto-server-8080.log --port 8080' ], { 'printStderr': true, 'printStdout': true }, () => setTimeout(() => complete(), 5000))
  })

  desc('Stop server')
  task('stop', [], { 'async': true }, () => {
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

namespace('proxy', () => {

  desc('Run HAProxy')
  task('run', [], { 'async': true }, () => {
    Jake.exec([ 'sudo haproxy -d -f ./deployment/haproxy.cfg' ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

  desc('Start HAProxy')
  task('start', [], { 'async': true }, () => {
    Jake.exec([ 'sudo haproxy -D -f ./deployment/haproxy.cfg' ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

  desc('Stop HAProxy')
  task('stop', [], { 'async': true }, () => {
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
