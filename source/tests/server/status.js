import Assert from 'assert'
import { Log, Process } from 'mablung'
import _Request from 'axios'

import Server from '../../server/server'

const Request = _Request.create({ 'baseURL': `http://${Process.env.ADDRESS}:${Process.env.PORT}` })

describe('/api/status', () => {

  before(async () => {

    await Server.start( Process.env.ADDRESS,
                        Process.env.PORT,
                        Process.env.STATIC_PATH,
                        Process.env.MODULES_PATH,
                        Process.env.DATABASE_URL)

  })

  describe('HEAD', () => {

    it(`should respond with 200 OK`, async () => {
      Assert.equal((await Request.head('/api/status')).status, 200)
    })

  })

  describe('GET', () => {

    let response = null

    before(async () => {
      response = await Request.get('/api/status')
    })

    it('should respond with 200 OK', () => {
      Assert.equal(response.status, 200)
    })

    it.skip('should be valid', () => {})

  })

  after(async () => {
    await Server.stop()
  })

})
