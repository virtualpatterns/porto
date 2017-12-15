import Is from '@pwn/is'
import { Log } from 'mablung'
import Request from 'axios'

import '../polyfill'
import Template from './template'

import ContentFn from './attendance.pug'

const DEFAULT_CONFIGURATION = {
  'baseUrl': ''
}

const templatePrototype = Template.getElementPrototype()
const attendancePrototype = Object.create(templatePrototype)

attendancePrototype.getContent = function(data = {}) {
  return templatePrototype.getContent.call(this, Object.assign({}, data, { Is }))
}

attendancePrototype.bind = function() {

  document.querySelector(`#${this.id}`).addEventListener('click', this._onClicked = this.onClicked.bind(this))

  templatePrototype.bind.call(this)

}

attendancePrototype.unbind = function() {

  templatePrototype.unbind.call(this)

  document.querySelector(`#${this.id}`).removeEventListener('click', this._onClicked)

}

attendancePrototype.onClicked = async function(event) {
  Log.debug('- attendancePrototype.onClicked(event) { ... }')

  if (event.target.matches('a.p-refresh')) {
    event.preventDefault()
    await this.onRefreshed()
  }
  else if (event.target.matches('a.p-attendee')) {
    event.preventDefault()
    await this.onAttended(event)
  }

}

attendancePrototype.onRefreshed = async function() {
  Log.debug('- attendancePrototype.onRefreshed() { ... }')

  try {

    window.showOverlay()

    this.attendance = null
    this.render()

    let response = null
    response = await Request.get('configuration.json')

    Log.inspect('response.data', response.data)

    this.configuration = response.data

    response = await Request.get('/api/attendance', {
      'baseURL': this.configuration.baseUrl
    })

    Log.inspect('response.data', response.data)

    this.attendance = response.data
    this.render()

  }
  catch (error) {
    alert(`An unknown error occurred (${error.message}).`)
  }
  finally {
    window.hideOverlay()
  }

}

attendancePrototype.onAttended = async function(event) {
  Log.debug('- attendancePrototype.onAttended() { ... }')
  Log.debug(`-   event.target['data-meeting-id']=${event.target['data-meeting-id']}`)
  Log.debug(`-   event.target['data-user-id']=${event.target['data-user-id']}`)
  Log.debug(`-   event.target['data-attended']=${event.target['data-attended']}`)

  try {

    window.showOverlay()

    let meetingId = event.target['data-meeting-id']
    let userId = event.target['data-user-id']
    let attended = event.target['data-attended']

    this.attendance.attendees
      .filter((attendee) => attendee.userId == event.target['data-user-id'])
      .forEach((attendee) => attendee.attended = 2)

    this.render()

    let response = await Request.post('/api/attendance', {
      'meetingId': meetingId,
      'userId': userId,
      'attended': attended == '0' ? 1 : 0
    }, {
      'baseURL': this.configuration.baseUrl
    })

    Log.inspect('response.data', response.data)

    this.attendance = response.data
    this.render()

  }
  catch (error) {
    alert(`An unknown error occurred (${error.message}).`)
  }
  finally {
    window.hideOverlay()
  }

}

const Attendance = Object.create(Template)

Attendance.createElement = function(parentSelector = 'div.p-body', contentFn = ContentFn, prototype = attendancePrototype) {

  let element =  Template.createElement.call(this, parentSelector, contentFn, prototype)

  element.configuration = DEFAULT_CONFIGURATION
  element.attendance = null

  return element

}

Attendance.isElement = function(attendance) {
  return attendancePrototype.isPrototypeOf(attendance)
}

Attendance.getElementPrototype = function() {
  return attendancePrototype
}

export default Attendance
