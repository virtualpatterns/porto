import CreateContent from 'virtual-dom/create-element'
import Diff from 'virtual-dom/diff'
import Is from '@pwn/is'
import { Log } from 'mablung'
// import { MDCCheckbox as Checkbox } from 'mdc-checkbox'
import Patch from 'virtual-dom/patch'
import Request from 'axios'

import Index from './index.pug'

document.addEventListener('DOMContentLoaded', onLoaded)

  // setInterval(async () => {
  //
  //   let response = await Request.get('/api/attendance')
  //
  //   let newVirtualContent = Index({
  //     'Is': Is,
  //     'attendance': response.data
  //   })
  //
  //   Patch(document.querySelector('#index > div.attendance'), Diff(virtualContent, newVirtualContent))
  //
  //   virtualContent = newVirtualContent
  //
  // }, 5000)

async function onLoaded() {
  Log.info('- onLoaded() { ... }')

  // try {

    let response = await Request.get('/api/attendance')

    let virtualContent = Index({
      'Is': Is,
      'attendance': response.data
    })

    document.querySelector('#index').appendChild(CreateContent(virtualContent))

    document.querySelectorAll('li.attendee div.mdc-checkbox').forEach(element => {
      mdc.checkbox.MDCCheckbox.attachTo(element)
    })

    document.querySelectorAll('li.attendee input').forEach(element => {
      element.addEventListener('change', onChange)
    })

  // }
  // catch (error) {
  // }

}

async function onChange(event) {
  Log.info('- onChange(event) { ... }')
  // Log.info(`-   event.target.dataset.meetingId = ${event.target.dataset.meetingId}`)
  // Log.info(`-   event.target.dataset.userId = ${event.target.dataset.userId}`)
  Log.info(`-   event.target.data-meeting-id = ${event.target['data-meeting-id']}`)
  Log.info(`-   event.target.data-user-id = ${event.target['data-user-id']}`)
  Log.info(`-   event.target.checked = ${event.target.checked}`)

  let response = await Request.put('/api/attendance', {
    'meetingId': event.target['data-meeting-id'],
    'userId': event.target['data-user-id'],
    'attended': event.target.checked
  })

}
