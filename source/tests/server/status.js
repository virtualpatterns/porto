import { assert as Assert } from 'chai'
import { Process } from 'mablung'
import _Request from 'axios'

const Request = _Request.create({ 'baseURL': Process.env.SERVER_URL })

const STATUS_SCHEMA = {
  'title': 'Status',
  'type': 'object',
  'properties': {
    'address': {
      'name': 'Status-Address',
      'type': 'object',
      'properties': {
        'remote': { 'type': 'string' },
        'forwarded': { 'type': 'string' }
      },
      'required': [ 'remote', 'forwarded' ]
    },
    'agent': { 'type': 'string' },
    'database': {
      'name': 'Status-Database',
      'type': 'object',
      'properties': {
        'name': { 'type': 'string' },
        'description': { 'type': 'string' },
        'size': { 'type': 'string' },
        'tables': {
          'type': 'array',
          'items': {
            'title': 'Status-Database-Table',
            'type': 'object',
            'properties': {
              'name': { 'type': 'string' },
              'rows': { 'type': 'number' },
              'size': { 'type': 'string' }
            },
            'required': [ 'name', 'rows', 'size' ]
          },
          'uniqueItems': true
        },
        'version': { 'type': 'string' }
      },
      'required': [ 'name', 'description', 'size', 'tables', 'version' ]
    },
    'heap': {
      'name': 'Status-Heap',
      'type': 'object',
      'properties': {
        'total': { 'type': 'string' },
        'used': { 'type': 'string' }
      },
      'required': [ 'total', 'used' ]
    },
    'now': { 'type': 'string' },
    'package': {
      'name': 'Status-Package',
      'type': 'object',
      'properties': {
        'name': { 'type': 'string' },
        'version':  { 'type': 'string' }
      },
      'required': [ 'name', 'version' ]
    }
  },
  'required': [ 'address', 'agent', 'database', 'heap', 'now', 'package' ],
  'additionalProperties': false,
}

describe('/api/status', () => {

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

})
