import 'babel-polyfill'
import Jake from 'jake'

namespace('get', () => {

  desc('GET /api/status')
  task('status', [], {}, () => {
    Jake.exec([ 'http GET http://localhost:8080/api/status' ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

  desc('GET /api/attendance')
  task('attendance', [], {}, () => {
    Jake.exec([ 'http GET http://localhost:8080/api/attendance' ], { 'printStderr': true, 'printStdout': true }, () => complete())
  })

})
