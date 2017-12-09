import { assert as Assert } from 'chai'
import Faker from 'faker'
import { Process } from 'mablung'
import Moment from 'moment'

import Database from '../../server/library/database'

describe('insertMeeting ...', () => {

  let connection = null

  before(async () => {
    connection = await Database.open(Process.env.DATABASE_URL)
  })

  describe('insertMeeting', () => {

    describe('(when inserting a new meeting date)', () => {

      let weekOf = Moment(Faker.date.future())

      before(async () => {
        await connection.insertMeeting(weekOf)
      })

      it('should create the meeting', async () => {
        Assert.ok(await connection.existsMeeting(weekOf))
      })

      after(async () => {
        await connection.deleteMeeting(weekOf)
      })

    })

    describe('(when inserting an existing meeting date)', () => {

      let weekOf = Moment(Faker.date.future())

      before(async () => {
        await connection.insertMeeting(weekOf)
      })

      it('should throw an error', async () => {

        try {

          await connection.insertMeeting(weekOf)

          Assert.fail()

        } catch (error) {
          // OK
        }

      })

      after(async () => {
        await connection.deleteMeeting(weekOf)
      })

    })

  })

  describe('deleteMeeting', () => {

    describe('(when deleting a meeting that exists)', () => {

      let weekOf = Moment(Faker.date.future())

      before(async () => {
        await connection.insertMeeting(weekOf)
        await connection.deleteMeeting(weekOf)
      })

      it('should delete the meeting', async () => {
        Assert.ok(!await connection.existsMeeting(weekOf))
      })

    })

    describe('(when deleting a meeting that does not exist)', () => {

      it('should not throw an error', async () => {
        await connection.deleteMeeting(Moment(Faker.date.future()))
      })

    })

  })

  describe('existsMeeting', () => {

    describe('(when the meeting does not exist)', () => {

      it('should be false', async () => {
        Assert.ok(!await connection.existsMeeting(Moment(Faker.date.future())))
      })

    })

    describe('(when the meeting exists)', () => {

      let weekOf = Moment(Faker.date.future())

      before(async () => {
        await connection.insertMeeting(weekOf)
      })

      it('should be true', async () => {
        Assert.ok(await connection.existsMeeting(weekOf))
      })

      after(async () => {
        await connection.deleteMeeting(weekOf)
      })

    })

  })

  describe('nextMeetingOn', () => {

    it('should be 2 days from a Monday', async () => {

      let weekOf = Moment('2017-11-13')
      let nextMeetingOn = await connection.nextMeetingOn(weekOf)

      Assert.equal(nextMeetingOn.diff(weekOf, 'days'), 2)

    })

    it('should be 1 day from a Tuesday', async () => {

      let weekOf = Moment('2017-11-14')
      let nextMeetingOn = await connection.nextMeetingOn(weekOf)

      Assert.equal(nextMeetingOn.diff(weekOf, 'days'), 1)

    })

    it('should be on a Wednesday', async () => {
      Assert.equal((await connection.nextMeetingOn(Moment(Faker.date.future()))).day(), 3)
    })

    it('should be 6 days from a Thursday', async () => {

      let weekOf = Moment('2017-11-16')
      let nextMeetingOn = await connection.nextMeetingOn(weekOf)

      Assert.equal(nextMeetingOn.diff(weekOf, 'days'), 6)

    })

    it('should be 5 days from a Friday', async () => {

      let weekOf = Moment('2017-11-17')
      let nextMeetingOn = await connection.nextMeetingOn(weekOf)

      Assert.equal(nextMeetingOn.diff(weekOf, 'days'), 5)

    })

    it('should be 4 days from a Saturday', async () => {

      let weekOf = Moment('2017-11-18')
      let nextMeetingOn = await connection.nextMeetingOn(weekOf)

      Assert.equal(nextMeetingOn.diff(weekOf, 'days'), 4)

    })

    it('should be 3 days from a Sunday', async () => {

      let weekOf = Moment('2017-11-19')
      let nextMeetingOn = await connection.nextMeetingOn(weekOf)

      Assert.equal(nextMeetingOn.diff(weekOf, 'days'), 3)

    })

  })

  after(async () => {
    await connection.close()
  })

})
