import Assert from 'assert'
import { Log, Process } from 'mablung'
import _Request from 'axios'

import Server from '../../server/server'

const Request = _Request.create({ 'baseURL': `http://${Process.env.ADDRESS}:${Process.env.PORT}` })

describe('(urls)', () => {

  before(async () => {

    await Server.start( Process.env.ADDRESS,
                        Process.env.PORT,
                        Process.env.STATIC_PATH,
                        Process.env.MODULES_PATH,
                        Process.env.DATABASE_URL)

  })

  let urls = [
    '/',
    '/favicon.ico',
    '/www',
    '/www/index.html',
    '/www/vendor/material/list/dist/mdc.list.min.css'
  ]

  describe('HEAD', () => {

    urls.forEach((url) => {
      it(`${url} should respond with 200 OK`, async () => {
        Assert.equal((await Request.head(url)).status, 200)
      })
    })

  })

  describe('GET', () => {

    urls.forEach((url) => {
      it(`${url} should respond with 200 OK`, async () => {
        Assert.equal((await Request.get(url)).status, 200)
      })
    })

  })

  after(async () => {
    await Server.stop()
  })

})
