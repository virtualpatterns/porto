import Assert from 'assert'
import Faker from 'faker'
import { Log, Process } from 'mablung'
import Moment from 'moment'
import Puppeteer from 'puppeteer'

import Database from '../../server/library/database'
import Server from '../../server/server'

describe('/www/index.html', () => {

  let connection = null

  let browser = null
  let page = null

  before(async () => {

    connection = await Database.open(Process.env.DATABASE_URL)

    await Server.start( Process.env.ADDRESS,
                        Process.env.PORT,
                        Process.env.STATIC_PATH,
                        Process.env.MODULES_PATH,
                        Process.env.DATABASE_URL)

    browser = await Puppeteer.launch()
    page = await browser.newPage()

    await page.goto(`http://${Process.env.ADDRESS}:${Process.env.PORT}`)

    // await page.screenshot({ 'path': 'porto.png' })

  })

  it('should show the next meeting date', async () => {

    let weekOf = Moment()
    let nextMeetingOn = await connection.nextMeetingOn(weekOf)

    Assert.equal(await page.evaluate(() => document.querySelector('span.mdc-toolbar__title').innerText), nextMeetingOn.format('ddd MMM D'))

  })

  it('should show the refresh link', async () => {
    Assert.ok(await page.evaluate(() => document.querySelector('a.p-refresh')))
  })

  describe('(when refreshed)', () => {

    let userId = null
    let userIdBefore = null
    let userIdAfter = null

    let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`
    let nameBefore = `Aa ${name}`
    let nameAfter = `Zz ${name}`

    before(async () => {

      userId = await connection.insertUser(name)
      userIdBefore = await connection.insertUser(nameBefore)
      userIdAfter = await connection.insertUser(nameAfter)

      await page.tap('a.p-refresh')
      await page.waitForSelector('div.p-overlay.p-overlay-hidden')

    })

    it('should show the inserted user', async () => {

      Assert.equal(await page.evaluate((userId) => {

        return Array.from(document.querySelectorAll('span.mdc-list-item__text'))
          .filter((element) => element['data-user-id'] == userId)
          .reduce((accumulator, element) => element.innerText, null)

      }, userId), name)

    })

    it('should show the inserted user as not attended', async () => {

      Assert.equal(await page.evaluate((userId) => {

        return Array.from(document.querySelectorAll('a.p-attendee'))
          .filter((element) => element['data-user-id'] == userId)
          .reduce((accumulator, element) => element.innerText, null)

      }, userId), 'clear')

    })

    it('attendance should be not attended for the inserted user', async () => {
      Assert.equal((await connection.getAttendance())
        .filter((row) => row.userId == userId)
        .reduce((accumulator, row) => row.attended, false), false)
    })

    describe('(when attended)', () => {

      before(async () => {

        let elements = await page.$$('a.p-attendee')
        let element = null

        for (let _element of elements) {

          let _handle = await _element.getProperty('data-user-id')
          let _userId = await _handle.jsonValue()

          if (_userId == userId) {
            element = _element
            break
          }

        }

        if (element) {
          await element.tap()
          await page.waitForSelector('div.p-overlay.p-overlay-hidden')
        }

      })

      it('should show the inserted user as attended', async () => {

        Assert.equal(await page.evaluate((userId) => {

          return Array.from(document.querySelectorAll('a.p-attendee'))
            .filter((element) => element['data-user-id'] == userId)
            .reduce((accumulator, element) => element.innerText, null)

        }, userId), 'done')

      })

      it('attendance should be attended for the inserted user', async () => {
        Assert.equal((await connection.getAttendance())
          .filter((row) => row.userId == userId)
          .reduce((accumulator, row) => row.attended, false), true)
      })

    })

    after(async () => {

      await connection.deleteUser(name)
      await connection.deleteUser(nameBefore)
      await connection.deleteUser(nameAfter)

    })

  })

  after(async () => {

    await browser.close()

    await Server.stop()
    await connection.close()

  })

})
