import Assert from 'assert'
import Faker from 'faker'
import { Log, Process } from 'mablung'
import Moment from 'moment'
import _Request from 'axios'

import Database from '../library/database'
import Server from '../server'

const Request = _Request.create({ 'baseURL': `http://${Process.env.ADDRESS}:${Process.env.PORT}` })

describe('attendance', () => {

  describe('attendance (api)', () => {

    before(async function () {

      await Database.open(Process.env.DATABASE_URL)

      await Server.start( Process.env.ADDRESS,
                          Process.env.PORT,
                          Process.env.STATIC_PATH,
                          Process.env.MODULES_PATH,
                          Process.env.DATABASE_URL)

    })

    describe('GET /api/attendance', () => {

      describe('(when the attendance does not exist)', () => {

        let meetingId = null
        let weekOf = Moment()

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async function () {

          meetingId = await Database.insertMeeting(weekOf)
          userId = await Database.insertUser(name)

        })

        it('attendance should have one row for this user', async function () {

          let response = await Request.get('/api/attendance')
          let attendance = response.data

          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .length, 1)

        })

        it('attendance should be not attended for this user', async function () {

          let response = await Request.get('/api/attendance')
          let attendance = response.data

          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .reduce((accumulator, attendee) => attendee.attended, false), false)

        })

        after(async function () {

          await Database.deleteUser(name)
          await Database.deleteMeeting(weekOf)

        })

      })

      describe('(when the attendance exists)', () => {

        let meetingId = null
        let weekOf = Moment()

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async function () {

          meetingId = await Database.insertMeeting(weekOf)
          userId = await Database.insertUser(name)

          await Database.insertAttendance(meetingId, userId, true)

        })

        it('attendance should have one row for this user', async function () {

          let response = await Request.get('/api/attendance')
          let attendance = response.data

          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .length, 1)

        })

        it('attendance should be attended for this user', async function () {

          let response = await Request.get('/api/attendance')
          let attendance = response.data

          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .reduce((accumulator, attendee) => attendee.attended, false), true)

        })

        after(async function () {

          await Database.deleteAttendance(meetingId, userId)

          await Database.deleteUser(name)
          await Database.deleteMeeting(weekOf)

        })

      })

    })

    describe('PUT /api/attendance', () => {

      describe('(when the attendance does not exist)', () => {

        let meetingId = null
        let weekOf = Moment()

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async function () {

          meetingId = await Database.insertMeeting(weekOf)
          userId = await Database.insertUser(name)

        })

        it('attendance should have one row for this user', async function () {

          let response = await Request.put('/api/attendance', {
            'meetingId': meetingId,
            'userId': userId,
            'attended': false
          })

          let attendance = response.data

          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .length, 1)

        })

        it('attendance should be not attended for this user', async function () {

          let response = await Request.put('/api/attendance', {
            'meetingId': meetingId,
            'userId': userId,
            'attended': false
          })

          let attendance = response.data

          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .reduce((accumulator, attendee) => attendee.attended, false), false)

        })

        after(async function () {

          await Database.deleteUser(name)
          await Database.deleteMeeting(weekOf)

        })

      })

      describe('(when the attendance exists)', () => {

        let meetingId = null
        let weekOf = Moment()

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async function () {

          meetingId = await Database.insertMeeting(weekOf)
          userId = await Database.insertUser(name)

          await Database.insertAttendance(meetingId, userId, false)

        })

        it('attendance should have one row for this user', async function () {

          let response = await Request.put('/api/attendance', {
            'meetingId': meetingId,
            'userId': userId,
            'attended': true
          })

          let attendance = response.data

          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .length, 1)

        })

        it('attendance should be attended for this user', async function () {

          let response = await Request.put('/api/attendance', {
            'meetingId': meetingId,
            'userId': userId,
            'attended': true
          })

          let attendance = response.data

          Assert.equal(attendance.attendees
            .filter((attendee) => attendee.userId == userId)
            .reduce((accumulator, attendee) => attendee.attended, false), true)

        })

        after(async function () {

          await Database.deleteAttendance(meetingId, userId)

          await Database.deleteUser(name)
          await Database.deleteMeeting(weekOf)

        })

      })

    })

    after(async function () {

      await Server.stop()
      await Database.close()

    })

  })

  describe('attendance (database)', () => {

    before(async function () {
      await Database.open(Process.env.DATABASE_URL)
    })

    describe('insertAttendance', () => {

      describe('(when the attendance does not exist)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async function () {

          meetingId = await Database.insertMeeting(weekOf)
          userId = await Database.insertUser(name)

          await Database.insertAttendance(meetingId, userId, false)

        })

        it('should create the attendance', async function () {
          Assert.ok(await Database.existsAttendance(meetingId, userId))
        })

        it('attendance should have one row for this user', async function () {
          Assert.equal((await Database.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .length, 1)
        })

        it('attendance should be not attended for this user', async function () {
          Assert.equal((await Database.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.attended, false), false)
        })

        after(async function () {

          await Database.deleteAttendance(meetingId, userId)

          await Database.deleteUser(name)
          await Database.deleteMeeting(weekOf)

        })

      })

      describe('(when the attendance exists)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async function () {

          meetingId = await Database.insertMeeting(weekOf)
          userId = await Database.insertUser(name)

          await Database.insertAttendance(meetingId, userId, false)
          await Database.insertAttendance(meetingId, userId, true)

        })

        it('should update the attendance', async function () {
          Assert.ok(await Database.existsAttendance(meetingId, userId))
        })

        it('attendance should have one row for this user', async function () {
          Assert.equal((await Database.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .length, 1)
        })

        it('attendance should be attended for this user', async function () {
          Assert.equal((await Database.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.attended, false), true)
        })

        after(async function () {

          await Database.deleteAttendance(meetingId, userId)

          await Database.deleteUser(name)
          await Database.deleteMeeting(weekOf)

        })

      })

    })

    describe('deleteAttendance', () => {

      describe('(when the attendance exists)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async function () {

          meetingId = await Database.insertMeeting(weekOf)
          userId = await Database.insertUser(name)

          await Database.insertAttendance(meetingId, userId, false)
          await Database.deleteAttendance(meetingId, userId)

        })

        it('should delete the attendance', async function () {
          Assert.ok(!await Database.existsAttendance(meetingId, userId))
        })

        after(async function () {

          await Database.deleteUser(name)
          await Database.deleteMeeting(weekOf)

        })

      })

      describe('(when the attendance does not exist)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async function () {

          meetingId = await Database.insertMeeting(weekOf)
          userId = await Database.insertUser(name)

        })

        it('should not throw an error', async function () {
          await Database.deleteAttendance(meetingId, userId)
        })

        after(async function () {

          await Database.deleteUser(name)
          await Database.deleteMeeting(weekOf)

        })

      })

    })

    describe('existsAttendance', () => {

      describe('(when the attendance does not exist)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async function () {

          meetingId = await Database.insertMeeting(weekOf)
          userId = await Database.insertUser(name)

        })

        it('should be false', async function () {
          Assert.ok(!await Database.existsAttendance(meetingId, userId))
        })

        after(async function () {

          await Database.deleteUser(name)
          await Database.deleteMeeting(weekOf)

        })

      })

      describe('(when the attendance exists)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async function () {

          meetingId = await Database.insertMeeting(weekOf)
          userId = await Database.insertUser(name)

          await Database.insertAttendance(meetingId, userId, false)

        })

        it('should be true', async function () {
          Assert.ok(await Database.existsAttendance(meetingId, userId))
        })

        after(async function () {

          await Database.deleteAttendance(meetingId, userId)

          await Database.deleteUser(name)
          await Database.deleteMeeting(weekOf)

        })

      })

    })

    describe('getAttendance', () => {

      describe('(when the attendance does not exist)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async function () {

          meetingId = await Database.insertMeeting(weekOf)
          userId = await Database.insertUser(name)

        })

        it('attendance should have one row for this user', async function () {
          Assert.equal((await Database.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .length, 1)
        })

        it('attendance should be null for this user', async function () {
          Assert.equal((await Database.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.attendanceId, null))
        })

        it('attendance should be not attended for this user', async function () {
          Assert.equal((await Database.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.attended, false), false)
        })

        after(async function () {

          await Database.deleteUser(name)
          await Database.deleteMeeting(weekOf)

        })

      })

      describe('(when the attendance exists)', () => {

        let meetingId = null
        let weekOf = Moment(Faker.date.future())

        let userId = null
        let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

        before(async function () {

          meetingId = await Database.insertMeeting(weekOf)
          userId = await Database.insertUser(name)

          await Database.insertAttendance(meetingId, userId, false)

        })

        it('attendance should have one row for this user', async function () {
          Assert.equal((await Database.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .length, 1)
        })

        it('attendance should be not null for this user', async function () {
          Assert.notEqual((await Database.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.attendanceId, null))
        })

        it('attendance should be not attended for this user', async function () {
          Assert.equal((await Database.getAttendance(meetingId))
            .filter((row) => row.userId == userId)
            .reduce((accumulator, row) => row.attended, false), false)
        })

        after(async function () {

          await Database.deleteAttendance(meetingId, userId)

          await Database.deleteUser(name)
          await Database.deleteMeeting(weekOf)

        })

      })

    })

    after(async function () {
      await Database.close()
    })

  })

})
