import { assert as Assert } from 'chai'
import { Process } from 'mablung'
import _Request from 'axios'

import Server from '../../server/server'

const Request = _Request.create({ 'baseURL': `http://${Process.env.ADDRESS}:${Process.env.PORT}` })

const STATUS_SCHEMA = {
  'title': 'Status',
  'type': 'object',
  'properties': {
    'name': { 'type': 'string' },
    'now': { 'type': 'string' },
    'version': { 'type': 'string' },
    'heap': {
      'name': 'Status-Heap',
      'type': 'object',
      'properties': {
        'total': {
          'type': 'number',
          'exclusiveMinimum': 0
        },
        'used': {
          'type': 'number',
          'exclusiveMinimum': 0
        }
      },
      'required': [ 'total', 'used' ]
    }
  },
  'required': [ 'name', 'now', 'version', 'heap' ],
  'additionalProperties': false,
}

describe('/api/status', () => {

  before(async () => {

    await Server.start(
      Process.env.ADDRESS,
      Process.env.PORT,
      Process.env.STATIC_PATH,
      Process.env.MODULES_PATH,
      Process.env.DATABASE_URL)

  })

  describe('HEAD', () => {

    it('should respond with 200 OK', async () => {
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

    it('should be valid', () => {
      Assert.jsonSchema(response.data, STATUS_SCHEMA)
    })

  })

  after(async () => {
    await Server.stop()
  })

})
