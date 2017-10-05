import Database from 'mysql'
import { Log } from 'mablung'
import Moment from 'moment'
import Promisify from 'es6-promisify'
import RESTErrors from 'restify-errors'

const Attendance = Object.create({})

Attendance.createRoutes = function(server, databaseUrl) {

  server.head('/api/attendance', (request, response, next) => {
    response.send(200)
    return next()
  })

  server.get('/api/attendance', async (request, response, next) => {

    try {

      let connection = Database.createConnection(databaseUrl)

      connection.Promise = {}
      connection.Promise.connect = Promisify(connection.connect, connection)
      connection.Promise.query = Promisify(connection.query, connection)

      await connection.Promise.connect()

      try {

        let [rows, fields] = await connection.Promise.query('call getAttendance(null)')
        let data = {}

        for (let row of rows) {

          if (!data.meetingId) {
            data.meetingId = row.meetingId
            data.meetingOn = row.meetingOn
            data.meetingDescription = `Meeting on ${Moment(row.meetingOn).format('dddd [the] Do')}`
            data.attendees = []
          }

          data.attendees.push({
            'userId': row.userId,
            'userName': row.userName,
            'attended': row.attended,
          })

        }

        response.send(200, data)
        return next()

      }
      finally {
        await connection.end()
      }

    }
    catch (error) {

      Log.error('- server.get(\'/api/attendance\', (request, response, next) => { ... })')
      Log.error(`    error.message='${error.message}'`)
      Log.error(`    error.stack ...\n\n${error.stack}\n`)

      return next(new RESTErrors.InternalServerError())

    }

  })

  server.put('/api/attendance', async (request, response, next) => {

    try {

      let connection = Database.createConnection(databaseUrl)

      connection.Promise = {}
      connection.Promise.connect = Promisify(connection.connect, connection)
      connection.Promise.query = Promisify(connection.query, connection)

      await connection.Promise.connect()

      try {

        let statement = 'call insertAttendance(?, ?, ?)'
        let values = [
          request.body.meetingId,
          request.body.userId,
          request.body.attended
        ]

        await connection.Promise.query(Database.format(statement, values))

        response.send(200)
        return next()

      }
      finally {
        await connection.end()
      }

    }
    catch (error) {

      Log.error('- server.put(\'/api/attendance\', (request, response, next) => { ... })')
      Log.error(`    error.message='${error.message}'`)
      Log.error(`    error.stack ...\n\n${error.stack}\n`)

      return next(new RESTErrors.InternalServerError())

    }

  })


}

export default Attendance
