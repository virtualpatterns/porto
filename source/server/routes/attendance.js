import { Log } from 'mablung'
import Moment from 'moment'
import RESTErrors from 'restify-errors'

import Database from '../database'

const Attendance = Object.create({})

Attendance.createRoutes = function(server, databaseUrl) {

  server.opts('/api/attendance', (request, response, next) => {

    Attendance.addHeaders(response)

    response.send(200, {})
    return next()

  })

  server.head('/api/attendance', (request, response, next) => {
    response.send(200, {})
    return next()
  })

  server.get('/api/attendance', async (request, response, next) => {

    Attendance.addHeaders(response)

    try {

      let connection = await Database.open(databaseUrl)

      try {

        response.send(200, Attendance.toJSON(await connection.getAttendance()))
        return next()

      }
      finally {
        await connection.close()
      }

    }
    catch (error) {

      Log.error('- server.get(\'/api/attendance\', (request, response, next) => { ... })')
      Log.error(`-   error.message='${error.message}'`)
      Log.error(`-   error.stack ...\n\n${error.stack}\n`)

      return next(new RESTErrors.InternalServerError())

    }

  })

  server.post('/api/attendance', async (request, response, next) => {

    Attendance.addHeaders(response)

    try {

      let connection = await Database.open(databaseUrl)

      try {

        response.send(200, Attendance.toJSON(await connection.insertAttendance(request.body.meetingId, request.body.userId, request.body.attended, request.header('X-Forwarded-For') || request.socket.remoteAddress, request.header('User-Agent'))))
        return next()

      }
      finally {
        await connection.end()
      }

    }
    catch (error) {

      Log.error('- server.post(\'/api/attendance\', (request, response, next) => { ... })')
      Log.error(`-   error.message='${error.message}'`)
      Log.error(`-   error.stack ...\n\n${error.stack}\n`)

      return next(new RESTErrors.InternalServerError())

    }

  })

}

Attendance.addHeaders = function(response) {

  response.header('Access-Control-Allow-Origin', '*')
  response.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST')
  response.header('Access-Control-Allow-Headers', 'Content-Type')
  
}

Attendance.toJSON = function(rows) {

  let data = {}

  for (let row of rows) {

    if (!data.meetingId) {
      data.meetingId = row.meetingId
      data.meetingOn = row.meetingOn
      data.meetingDescription = `${Moment(row.meetingOn).format('ddd MMM D')}`
      data.attendees = []
    }

    if (row.userId) {
      data.attendees.push({
        'userId': row.userId,
        'userName': row.userName,
        'attended': row.attended,
      })
    }

  }

  return data

}

export default Attendance
