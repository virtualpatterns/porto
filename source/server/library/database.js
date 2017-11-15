import _Database from 'mysql'
import Is from '@pwn/is'
import { Log } from 'mablung'
import Moment from 'moment'
import Promisify from 'es6-promisify'

const Database = Object.create(_Database)

Database.open = async function(...parameters) {

  this.connection = _Database.createConnection.apply(_Database, parameters)

  this.connect = Promisify(this.connection.connect, this.connection)
  this.query = Promisify(this.connection.query, this.connection)
  this.end = Promisify(this.connection.end, this.connection)

  await this.connect()

}

Database.existsUser = async function(name) {
  let [ , rows ] = await this.query(Database.format('set @existsUser = existsUser(0, ?); select @existsUser as existsUser;', [ name ]))
  return rows[0].existsUser
}

Database.insertUser = async function(name) {
  let [ , , rows ] = await this.query(Database.format('set @userId = 0; call insertUser(@userId, ?); select @userId as userId;', [ name ]))
  return rows[0].userId
}

Database.updateUser = async function(userId, name) {
  await this.query(Database.format('call updateUser(?, ?);', [ userId, name ]))
}

Database.deleteUser = async function(name) {
  await this.query(Database.format('call deleteUser(?);', [ name ]))
}

Database.nextMeetingOn = async function(weekOf) {
  Log.debug(`- Database.nextMeetingOn('${weekOf.toDate()}') { ... }`)

  let [ , rows ] = await this.query(Database.format('set @nextMeetingOn = nextMeetingOn(?); select @nextMeetingOn as nextMeetingOn;', [ weekOf.toDate() ]))
  // let nextMeetingOn = new Date(rows[0].nextMeetingOn)
  let nextMeetingOn = Moment(rows[0].nextMeetingOn)

  Log.debug(`-   rows[0].nextMeetingOn='${rows[0].nextMeetingOn}'`)
  Log.debug(`-   nextMeetingOn='${nextMeetingOn.toDate()}'`)

  return nextMeetingOn

}

Database.existsMeeting = async function(on) {
  let [ , rows ] = await this.query(Database.format('set @existsMeeting = existsMeeting(0, ?); select @existsMeeting as existsMeeting;', [ on.toDate() ]))
  return rows[0].existsMeeting
}

Database.insertMeeting = async function(weekOf) {
  let [ , , rows ] = await this.query(Database.format('set @meetingId = 0; call insertMeeting(@meetingId, ?); select @meetingId as meetingId;', [ weekOf.toDate() ]))
  return rows[0].meetingId
}

Database.deleteMeeting = async function(weekOf) {
  await this.query(Database.format('call deleteMeeting(?);', [ weekOf.toDate() ]))
}

Database.existsAttendance = async function(meetingId, userId) {
  let [ , rows ] = await this.query(Database.format('set @existsAttendance = existsAttendance(0, ?, ?); select @existsAttendance as existsAttendance;', [ meetingId, userId ]))
  return rows[0].existsAttendance
}

Database.insertAttendance = async function(meetingId, userId, attended) {
  let [ rows, fields ] = await this.query(Database.format('call insertAttendance(?, ?, ?);', [ meetingId, userId, attended ]))
  return rows
}

Database.deleteAttendance = async function(meetingId, userId) {
  await this.query(Database.format('call deleteAttendance(?, ?);', [ meetingId, userId ]))
}

Database.getAttendance = async function(...parameters) {

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

  let [ rows, fields ] = await this.query(Database.format('call getAttendance(?, ?);', [ meetingId, weekOf ]))
  return rows

}

Database.close = async function() {

  await this.end()

  this.connect = null
  this.query = null
  this.end = null

  this.connection = null

}

export default Database
