import _Database from 'mysql'
import Is from '@pwn/is'
import { Log } from 'mablung'
import Moment from 'moment'
import Promisify from 'es6-promisify'

const connectionPrototype = Object.create({})

connectionPrototype.existsUser = async function(name) {
  let [ , rows ] = await this.query(this._connection.format('set @existsUser = existsUser(0, ?); select @existsUser as existsUser;', [ name ]))
  return rows[0].existsUser
}

connectionPrototype.insertUser = async function(name) {
  let [ , , rows ] = await this.query(this._connection.format('set @userId = 0; call insertUser(@userId, ?); select @userId as userId;', [ name ]))
  return rows[0].userId
}

connectionPrototype.updateUser = async function(userId, name) {
  await this.query(this._connection.format('call updateUser(?, ?);', [ userId, name ]))
}

connectionPrototype.deleteUser = async function(name) {
  await this.query(this._connection.format('call deleteUser(?);', [ name ]))
}

connectionPrototype.deleteAllUsers = async function() {
  await this.query(this._connection.format('call deleteAllUsers();'))
}

connectionPrototype.restoreAllUsers = async function() {
  await this.query(this._connection.format('call restoreAllUsers();'))
}

connectionPrototype.nextMeetingOn = async function(weekOf) {
  Log.debug(`- this.nextMeetingOn('${weekOf.toDate()}') { ... }`)

  let [ , rows ] = await this.query(this._connection.format('set @nextMeetingOn = nextMeetingOn(?); select @nextMeetingOn as nextMeetingOn;', [ weekOf.toDate() ]))
  // let nextMeetingOn = new Date(rows[0].nextMeetingOn)
  let nextMeetingOn = Moment(rows[0].nextMeetingOn)

  Log.debug(`-   rows[0].nextMeetingOn='${rows[0].nextMeetingOn}'`)
  Log.debug(`-   nextMeetingOn='${nextMeetingOn.toDate()}'`)

  return nextMeetingOn

}

connectionPrototype.existsMeeting = async function(on) {
  let [ , rows ] = await this.query(this._connection.format('set @existsMeeting = existsMeeting(0, ?); select @existsMeeting as existsMeeting;', [ on.toDate() ]))
  return rows[0].existsMeeting
}

connectionPrototype.insertMeeting = async function(weekOf) {
  let [ , , rows ] = await this.query(this._connection.format('set @meetingId = 0; call insertMeeting(@meetingId, ?); select @meetingId as meetingId;', [ weekOf.toDate() ]))
  return rows[0].meetingId
}

connectionPrototype.deleteMeeting = async function(weekOf) {
  await this.query(this._connection.format('call deleteMeeting(?);', [ weekOf.toDate() ]))
}

connectionPrototype.existsAttendance = async function(meetingId, userId) {
  let [ , rows ] = await this.query(this._connection.format('set @existsAttendance = existsAttendance(0, ?, ?); select @existsAttendance as existsAttendance;', [ meetingId, userId ]))
  return rows[0].existsAttendance
}

connectionPrototype.insertAttendance = async function(meetingId, userId, attended) {
  let [ rows, ] = await this.query(this._connection.format('call insertAttendance(?, ?, ?);', [ meetingId, userId, attended ]))
  return rows
}

connectionPrototype.deleteAttendance = async function(meetingId, userId) {
  await this.query(this._connection.format('call deleteAttendance(?, ?);', [ meetingId, userId ]))
}

connectionPrototype.getAttendance = async function(...parameters) {

  let meetingId = null
  let weekOf = null

  if (Is.integer(parameters[0])) {
    meetingId = parameters[0]
    weekOf = null
  } else if (Is.date(parameters[0])) {
    meetingId = null
    weekOf = parameters[0]
  } else {
    meetingId = null
    weekOf = null
  }

  let [ rows, ] = await this.query(this._connection.format('call getAttendance(?, ?);', [ meetingId, weekOf ]))
  return rows

}

connectionPrototype.close = async function() {

  await this._connection.end()

  this.connect = null
  this.query = null
  this.end = null

  this._connection = null

}

const Connection = Object.create({})

Connection.createConnection = function(_connection, prototype = connectionPrototype) {

  let connection = Object.create(prototype)

  connection.connect = Promisify(_connection.connect, _connection)
  connection.query = Promisify(_connection.query, _connection)
  connection.end = Promisify(_connection.end, _connection)

  connection._connection = _connection

  return connection

}

Connection.isConnection = function(connection) {
  return connectionPrototype.isPrototypeOf(connection)
}

Connection.getConnectionPrototype = function() {
  return connectionPrototype
}

const Database = Object.create({})

Database.open = async function(...parameters) {

  let connection = Connection.createConnection(_Database.createConnection.apply(_Database, parameters))

  await connection.connect()

  return connection

}

export default Database
