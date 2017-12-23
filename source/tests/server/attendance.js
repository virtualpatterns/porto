import { assert as Assert } from 'chai'
import Faker from 'faker'
import { Process } from 'mablung'
import Moment from 'moment'
import _Request from 'axios'

import Database from '../../server/database'

const Request = _Request.create({ 'baseURL': Process.env.SERVER_URL })

const ATTENDANCE_SCHEMA = {
  'title': 'Attendance',
  'type': 'object',
  'properties': {
    'meetingId': { 'type': 'number' },
    'meetingOn': { 'type': 'string' },
    'meetingDescription': { 'type': 'string' },
    'attendees': {
      'type': 'array',
      'items': {
        'title': 'Attendance-Attendee',
        'type': 'object',
        'properties': {
          'userId': { 'type': 'number' },
          'userName': { 'type': 'string' },
          'attended': {
            'type': 'number',
            'enum': [ 0, 1 ]
          }
        },
        'required': [ 'userId', 'userName', 'attended' ]
      },
      'uniqueItems': true
    },
  },
  'required': [ 'meetingId', 'meetingOn', 'meetingDescription', 'attendees' ]
}

const REMOTE_ADDRESS = '0.0.0.0'
const USER_AGENT = 'User-Agent'

describe('attendance', () => {

  describe('/api/attendance', () => {

    let connection = null

    before(async () => {
      connection = await Database.open(Process.env.DATABASE_URL)
    })

    describe('OPTIONS', () => {

      it('should respond with 200 OK', async () => {
        Assert.equal((await Request.options('/api/attendance')).status, 200)
      })

      it.skip('should respond with the \'Access-Control-Allow-Origin\' header', async () => {
        Assert.equal((await Request.options('/api/attendance')).headers['access-control-allow-origin'], '*')
      })

      it.skip('should respond with the \'Access-Control-Allow-Methods\' header', async () => {
        Assert.equal((await Request.options('/api/attendance')).headers['access-control-allow-methods'], 'GET, HEAD, OPTIONS, POST')
      })

      it.skip('should respond with the \'Access-Control-Allow-Headers\' header', async () => {
        Assert.equal((await Request.options('/api/attendance')).headers['access-control-allow-headers'], 'Content-Type')
      })

    })

    describe('HEAD', () => {

      it('should respond with 200 OK', async () => {
        Assert.equal((await Request.head('/api/attendance')).status, 200)
      })

    })

    describe('GET', () => {

      describe('(when the procedure getAttendance does not exist)', () => {

        let fromName = 'getAttendance'
        let toName = `_get${Faker.database.column()}`

        before(async () => {
          await connection.renameProcedure(fromName, toName)
        })

        it('should throw an error', async () => {

          try {

            await Request.get('/api/attendance')

            Assert.fail()

          } catch (error) {
            // OK
          }

        })

        after(async () => {
          await connection.renameProcedure(toName, fromName)
        })

      })

      describe('(when no users exist)', () => {

        let meetingId = null
        let weekOf = Moment()

        let attendance = null

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          await connection.deleteAllUsers()

          attendance = (await Request.get('/api/attendance')).data

        })

        it('should be valid', async () => {
          Assert.jsonSchema(attendance, ATTENDANCE_SCHEMA)
        })

        it('should respond with this meeting', async () => {
          Assert.equal(attendance.meetingId, meetingId)
        })

        it('should respond with 0 attendees', async () => {
          Assert.equal(attendance.attendees
            .length, 0)
        })

        after(async () => {
          await connection.restoreAllUsers()
        })

      })

      describe('(when the attendance does not exist)', () => {

        let meetingId = null
        let weekOf = Moment()

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        let attendance = null

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          userId = await connection.insertUser(name)

          attendance = (await Request.get('/api/attendance')).data

        })

        it('should be valid', async () => {
          Assert.jsonSchema(attendance, ATTENDANCE_SCHEMA)
        })

        it('should respond with this meeting', async () => {
          Assert.equal(attendance.meetingId, meetingId)
        })

        it('should respond with one row for this user', async () => {
          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .length, 1)
        })

        it('should respond with not attended for this user', async () => {
          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .reduce((accumulator, attendee) => attendee.attended, false), false)
        })

        after(async () => {
          await connection.deleteUser(name)
        })

      })

      describe('(when the attendance exists as not attended)', () => {

        let meetingId = null
        let weekOf = Moment()

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        let attendance = null

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          userId = await connection.insertUser(name)

          await connection.insertAttendance(meetingId, userId, false, REMOTE_ADDRESS, USER_AGENT)

          attendance = (await Request.get('/api/attendance')).data

        })

        it('should be valid', async () => {
          Assert.jsonSchema(attendance, ATTENDANCE_SCHEMA)
        })

        it('should respond with this meeting', async () => {
          Assert.equal(attendance.meetingId, meetingId)
        })

        it('should respond with one row for this user', async () => {
          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .length, 1)
        })

        it('should respond with not attended for this user', async () => {
          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .reduce((accumulator, attendee) => attendee.attended, false), false)
        })

        after(async () => {
          await connection.deleteAttendance(meetingId, userId)
          await connection.deleteUser(name)
        })

      })

      describe('(when the attendance exists as attended)', () => {

        let meetingId = null
        let weekOf = Moment()

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        let attendance = null

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          userId = await connection.insertUser(name)

          await connection.insertAttendance(meetingId, userId, true, REMOTE_ADDRESS, USER_AGENT)

          attendance = (await Request.get('/api/attendance')).data

        })

        it('should be valid', async () => {
          Assert.jsonSchema(attendance, ATTENDANCE_SCHEMA)
        })

        it('should respond with this meeting', async () => {
          Assert.equal(attendance.meetingId, meetingId)
        })

        it('should respond with one row for this user', async () => {
          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .length, 1)
        })

        it('should respond with attended for this user', async () => {
          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .reduce((accumulator, attendee) => attendee.attended, false), true)
        })

        after(async () => {
          await connection.deleteAttendance(meetingId, userId)
          await connection.deleteUser(name)
        })

      })

    })

    describe('POST', () => {

      describe('(when the meeting does not exist)', () => {

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async () => {
          userId = await connection.insertUser(name)
        })

        it('should throw an error', async () => {

          try {

            await Request.post('/api/attendance', {
              'meetingId': 0,
              'userId': userId,
              'attended': false
            })

            Assert.fail()

          } catch (error) {
            // OK
          }

        })

        after(async () => {
          await connection.deleteUser(name)
        })

      })

      describe('(when the user does not exist)', () => {

        let meetingId = null
        let weekOf = Moment()

        before(async () => {
          meetingId = await connection.insertMeeting(weekOf)
        })

        it('should throw an error', async () => {

          try {

            await Request.post('/api/attendance', {
              'meetingId': meetingId,
              'userId': 0,
              'attended': false
            })

            Assert.fail()

          } catch (error) {
            // OK
          }

        })

      })

      describe('(when the attendance does not exist)', () => {

        let meetingId = null
        let weekOf = Moment()

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        let attendance = null

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          userId = await connection.insertUser(name)

          let response = await Request.post('/api/attendance', {
            'meetingId': meetingId,
            'userId': userId,
            'attended': false
          })

          attendance = response.data

        })

        it('should be valid', async () => {
          Assert.jsonSchema(attendance, ATTENDANCE_SCHEMA)
        })

        it('should respond with this meeting', async () => {
          Assert.equal(attendance.meetingId, meetingId)
        })

        it('should respond with one row for this user', async () => {
          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .length, 1)
        })

        it('should respond with not attended for this user', async () => {
          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .reduce((accumulator, attendee) => attendee.attended, false), false)
        })

        after(async () => {
          await connection.deleteUser(name)
        })

      })

      describe('(when the attendance exists)', () => {

        let meetingId = null
        let weekOf = Moment()

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        let attendance = null

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          userId = await connection.insertUser(name)

          await connection.insertAttendance(meetingId, userId, false, REMOTE_ADDRESS, USER_AGENT)

          let response = await Request.post('/api/attendance', {
            'meetingId': meetingId,
            'userId': userId,
            'attended': true
          })

          attendance = response.data

        })

        it('should be valid', async () => {
          Assert.jsonSchema(attendance, ATTENDANCE_SCHEMA)
        })

        it('should respond with this meeting', async () => {
          Assert.equal(attendance.meetingId, meetingId)
        })

        it('should respond with one row for this user', async () => {
          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .length, 1)
        })

        it('should respond with attended for this user', async () => {
          Assert.equal(attendance.attendees

            .filter((attendee) => attendee.userId == userId)
            .reduce((accumulator, attendee) => attendee.attended, false), true)
        })

        after(async () => {
          await connection.deleteAttendance(meetingId, userId)
          await connection.deleteUser(name)
        })

      })

    })

    after(async () => {
      await connection.close()
    })

  })

  describe('insertAttendance ...', () => {

    let connection = null

    before(async () => {
      connection = await Database.open(Process.env.DATABASE_URL)
    })

    describe('insertAttendance', () => {

      describe('(when inserting an attendance that does not exist)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          userId = await connection.insertUser(name)

          await connection.insertAttendance(meetingId, userId, false, REMOTE_ADDRESS, USER_AGENT)

        })

        it('should create the attendance', async () => {
          Assert.ok(await connection.existsAttendance(meetingId, userId))
        })

        it('attendance should have one row for this user', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .length, 1)
        })

        it('attendance should be not attended for this user', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.attended, false), false)
        })

        after(async () => {

          await connection.deleteAttendance(meetingId, userId)

          await connection.deleteUser(name)
          await connection.deleteMeeting(weekOf)

        })

      })

      describe('(when inserting an attendance that exists)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          userId = await connection.insertUser(name)

          await connection.insertAttendance(meetingId, userId, false, REMOTE_ADDRESS, USER_AGENT)
          await connection.insertAttendance(meetingId, userId, true, REMOTE_ADDRESS, USER_AGENT)

        })

        it('should update the attendance', async () => {
          Assert.ok(await connection.existsAttendance(meetingId, userId))
        })

        it('attendance should have one row for this user', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .length, 1)
        })

        it('attendance should be attended for this user', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.attended, false), true)
        })

        after(async () => {

          await connection.deleteAttendance(meetingId, userId)

          await connection.deleteUser(name)
          await connection.deleteMeeting(weekOf)

        })

      })

    })

    describe('deleteAttendance', () => {

      describe('(when deleting an attendance that exists)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          userId = await connection.insertUser(name)

          await connection.insertAttendance(meetingId, userId, false, REMOTE_ADDRESS, USER_AGENT)
          await connection.deleteAttendance(meetingId, userId)

        })

        it('should delete the attendance', async () => {
          Assert.ok(!await connection.existsAttendance(meetingId, userId))
        })

        after(async () => {

          await connection.deleteUser(name)
          await connection.deleteMeeting(weekOf)

        })

      })

      describe('(when deleting an attendance that does not exist)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          userId = await connection.insertUser(name)

        })

        it('should not throw an error', async () => {
          await connection.deleteAttendance(meetingId, userId)
        })

        after(async () => {

          await connection.deleteUser(name)
          await connection.deleteMeeting(weekOf)

        })

      })

    })

    describe('deleteAllUsers', () => {

      let meetingId = null
      let weekOf = Moment(Faker.date.future())

      let userId0 = null
      let name0 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      let userId1 = null
      let name1 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      let userId2 = null
      let name2 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      before(async () => {

        meetingId = await connection.insertMeeting(weekOf)

        userId0 = await connection.insertUser(name0)
        userId1 = await connection.insertUser(name1)
        userId2 = await connection.insertUser(name2)

        await connection.insertAttendance(meetingId, userId0, false, REMOTE_ADDRESS, USER_AGENT)
        await connection.insertAttendance(meetingId, userId1, false, REMOTE_ADDRESS, USER_AGENT)
        await connection.insertAttendance(meetingId, userId2, false, REMOTE_ADDRESS, USER_AGENT)

        await connection.deleteAllUsers()

      })

      it('should delete the first attendance', async () => {
        Assert.ok(!await connection.existsAttendance(meetingId, userId0))
      })

      it('should delete the second attendance', async () => {
        Assert.ok(!await connection.existsAttendance(meetingId, userId1))
      })

      it('should delete the third attendance', async () => {
        Assert.ok(!await connection.existsAttendance(meetingId, userId2))
      })

      after(async () => {

        await connection.restoreAllUsers()

        await connection.deleteUser(name2)
        await connection.deleteUser(name1)
        await connection.deleteUser(name0)

        await connection.deleteMeeting(weekOf)

      })

    })

    describe('restoreAllUsers', () => {

      let meetingId = null
      let weekOf = Moment(Faker.date.future())

      let userId0 = null
      let name0 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      let userId1 = null
      let name1 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      let userId2 = null
      let name2 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      before(async () => {

        meetingId = await connection.insertMeeting(weekOf)

        userId0 = await connection.insertUser(name0)
        userId1 = await connection.insertUser(name1)
        userId2 = await connection.insertUser(name2)

        await connection.insertAttendance(meetingId, userId0, true, REMOTE_ADDRESS, USER_AGENT)
        await connection.insertAttendance(meetingId, userId1, true, REMOTE_ADDRESS, USER_AGENT)
        await connection.insertAttendance(meetingId, userId2, true, REMOTE_ADDRESS, USER_AGENT)

        await connection.deleteAllUsers()
        await connection.restoreAllUsers()

      })

      it('should restore the first attendance', async () => {
        Assert.ok(await connection.existsAttendance(meetingId, userId0))
      })

      it('should restore the second attendance', async () => {
        Assert.ok(await connection.existsAttendance(meetingId, userId1))
      })

      it('should restore the third attendance', async () => {
        Assert.ok(await connection.existsAttendance(meetingId, userId2))
      })

      after(async () => {

        await connection.deleteUser(name2)
        await connection.deleteUser(name1)
        await connection.deleteUser(name0)

        await connection.deleteMeeting(weekOf)

      })

    })

    describe('existsAttendance', () => {

      describe('(when the attendance does not exist)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          userId = await connection.insertUser(name)

        })

        it('should be false', async () => {
          Assert.ok(!await connection.existsAttendance(meetingId, userId))
        })

        after(async () => {

          await connection.deleteUser(name)
          await connection.deleteMeeting(weekOf)

        })

      })

      describe('(when the attendance exists)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          userId = await connection.insertUser(name)

          await connection.insertAttendance(meetingId, userId, false, REMOTE_ADDRESS, USER_AGENT)

        })

        it('should be true', async () => {
          Assert.ok(await connection.existsAttendance(meetingId, userId))
        })

        after(async () => {

          await connection.deleteAttendance(meetingId, userId)

          await connection.deleteUser(name)
          await connection.deleteMeeting(weekOf)

        })

      })

    })

    describe('getAttendance', () => {

      describe('(when no users exist)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          await connection.deleteAllUsers()

        })

        it('attendance should have one row', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .length, 1)
        })

        it('attendance should have this meeting', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .reduce((accumulator, row) => row.meetingId, null), meetingId)
        })

        it('attendance should have a null user', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .reduce((accumulator, row) => row.userId, null), null)
        })

        after(async () => {

          await connection.restoreAllUsers()
          await connection.deleteMeeting(weekOf)

        })

      })

      describe('(when the attendance does not exist)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          userId = await connection.insertUser(name)

        })

        it('attendance should have one row for this user', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .length, 1)
        })

        it('attendance should be null for this user', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.attendanceId, null), null)
        })

        it('attendance should be not attended for this user', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.attended, false), false)
        })

        it('attendance (remote address) should be null for this user', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.remoteAddress, null), null)
        })

        it('attendance (user agent) should be null for this user', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.userAgent, null), null)
        })

        after(async () => {

          await connection.deleteUser(name)
          await connection.deleteMeeting(weekOf)

        })

      })

      describe('(when the attendance exists as not attended)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          userId = await connection.insertUser(name)

          await connection.insertAttendance(meetingId, userId, false, REMOTE_ADDRESS, USER_AGENT)

        })

        it('attendance should have one row for this user', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .length, 1)
        })

        it('attendance should be not null for this user', async () => {
          Assert.notEqual((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.attendanceId, null), null)
        })

        it('attendance should be not attended for this user', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.attended, false), false)
        })

        it(`attendance (remote address) should be '${REMOTE_ADDRESS}' for this user`, async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.remoteAddress, null), REMOTE_ADDRESS)
        })

        it(`attendance (user agent) should be '${USER_AGENT}' for this user`, async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.userAgent, null), USER_AGENT)
        })

        after(async () => {

          await connection.deleteAttendance(meetingId, userId)

          await connection.deleteUser(name)
          await connection.deleteMeeting(weekOf)

        })

      })

      describe('(when the attendance exists as attended)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async () => {

          meetingId = await connection.insertMeeting(weekOf)
          userId = await connection.insertUser(name)

          await connection.insertAttendance(meetingId, userId, true, REMOTE_ADDRESS, USER_AGENT)

        })

        it('attendance should have one row for this user', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .length, 1)
        })

        it('attendance should be not null for this user', async () => {
          Assert.notEqual((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.attendanceId, null), null)
        })

        it('attendance should be attended for this user', async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.attended, false), true)
        })

        it(`attendance (remote address) should be '${REMOTE_ADDRESS}' for this user`, async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.remoteAddress, null), REMOTE_ADDRESS)
        })

        it(`attendance (user agent) should be '${USER_AGENT}' for this user`, async () => {
          Assert.equal((await connection.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.userAgent, null), USER_AGENT)
        })

        after(async () => {

          await connection.deleteAttendance(meetingId, userId)

          await connection.deleteUser(name)
          await connection.deleteMeeting(weekOf)

        })

      })

    })

    after(async () => {
      await connection.close()
    })

  })

})
