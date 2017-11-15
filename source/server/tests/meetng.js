import Assert from 'assert'
import Faker from 'faker'
import { Log, Process } from 'mablung'
import Moment from 'moment'

import Database from '../library/database'

describe('meeting (database)', () => {

  before(async function () {
    await Database.open(Process.env.DATABASE_URL)
  })

  describe('insertMeeting', () => {

    describe('(when the meeting date does not exist)', () => {

      let meetingId = null
      let weekOf = Moment(Faker.date.future())

      before(async function () {
        meetingId = await Database.insertMeeting(weekOf)
      })

      it('should create the meeting', async function () {
        Assert.ok(await Database.existsMeeting(weekOf))
      })

      after(async function () {
        await Database.deleteMeeting(weekOf)
      })

    })

    describe('(when the meeting date exists)', () => {

      let meetingId = null
      let weekOf = Moment(Faker.date.future())

      before(async function () {
        meetingId = await Database.insertMeeting(weekOf)
      })

      it('should throw an error', async function () {

        try {
          await Database.insertMeeting(weekOf)
          Assert.fail()
        }
        catch (error) {}

      })

      after(async function () {
        await Database.deleteMeeting(weekOf)
      })

    })

  })

  describe('deleteMeeting', () => {

    describe('(when the meeting exists)', () => {

      let meetingId = null
      let weekOf = Moment(Faker.date.future())

      before(async function () {
        meetingId = await Database.insertMeeting(weekOf)
        await Database.deleteMeeting(weekOf)
      })

      it('should delete the meeting', async function () {
        Assert.ok(!await Database.existsMeeting(weekOf))
      })

    })

    describe('(when the meeting does not exist)', () => {

      it('should not throw an error', async function () {
        await Database.deleteMeeting(Moment(Faker.date.future()))
      })

    })

  })

  describe('existsMeeting', () => {

    describe('(when the meeting does not exist)', () => {

      it('should be false', async function () {
        Assert.ok(!await Database.existsMeeting(Moment(Faker.date.future())))
      })

    })

    describe('(when the meeting exists)', () => {

      let meetingId = null
      let weekOf = Moment(Faker.date.future())

      before(async function () {
        meetingId = await Database.insertMeeting(weekOf)
      })

      it('should be true', async function () {
        Assert.ok(await Database.existsMeeting(weekOf))
      })

      after(async function () {
        await Database.deleteMeeting(weekOf)
      })

    })

  })

  describe('nextMeetingOn', () => {

    it('should be 2 days from a Monday', async function () {

      let weekOf = Moment('2017-11-13')
      let nextMeetingOn = await Database.nextMeetingOn(weekOf)

      Assert.equal(nextMeetingOn.diff(weekOf, 'days'), 2)

    })

    it('should be 1 day from a Tuesday', async function () {

      let weekOf = Moment('2017-11-14')
      let nextMeetingOn = await Database.nextMeetingOn(weekOf)

      Assert.equal(nextMeetingOn.diff(weekOf, 'days'), 1)

    })

    it('should be on a Wednesday', async function () {
      Assert.equal((await Database.nextMeetingOn(Moment(Faker.date.future()))).day(), 3)
    })

    it('should be 6 days from a Thursday', async function () {

      let weekOf = Moment('2017-11-16')
      let nextMeetingOn = await Database.nextMeetingOn(weekOf)

      Assert.equal(nextMeetingOn.diff(weekOf, 'days'), 6)

    })

    it('should be 5 days from a Friday', async function () {

      let weekOf = Moment('2017-11-17')
      let nextMeetingOn = await Database.nextMeetingOn(weekOf)

      Assert.equal(nextMeetingOn.diff(weekOf, 'days'), 5)

    })

    it('should be 4 days from a Saturday', async function () {

      let weekOf = Moment('2017-11-18')
      let nextMeetingOn = await Database.nextMeetingOn(weekOf)

      Assert.equal(nextMeetingOn.diff(weekOf, 'days'), 4)

    })

    it('should be 3 days from a Sunday', async function () {

      let weekOf = Moment('2017-11-19')
      let nextMeetingOn = await Database.nextMeetingOn(weekOf)

      Assert.equal(nextMeetingOn.diff(weekOf, 'days'), 3)

    })

  })

  after(async function () {
    await Database.close()
  })

})
