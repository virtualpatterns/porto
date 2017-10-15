import CreateContent from 'virtual-dom/create-element'
import Diff from 'virtual-dom/diff'
import Is from '@pwn/is'
import { Log } from 'mablung'
import { MDCLinearProgress } from '@material/linear-progress'
import { MDCSnackbar } from '@material/snackbar'
import Patch from 'virtual-dom/patch'
import Request from 'axios'
import Utilities from 'util'

import VirtualTemplate from './index.pug'

document.addEventListener('DOMContentLoaded', onLoaded)

function showMessage(text) {
  document.querySelector('#snackbar').MDCSnackbar.show({
    'actionHandler': () => {},
    'actionOnBottom': true,
    'actionText': 'CLOSE',
    'message': text,
    'multiline': true,
    'timeout': 15000
  })
}

function bind() {
  Log.info('- bind() { ... }')

  document.querySelector('#refresh').addEventListener('click', onRefresh)

  document.querySelectorAll('a.attendee').forEach(element => {
    element.addEventListener('click', onClick)
  })

}

function unbind() {
  Log.info('- unbind() { ... }')

  document.querySelectorAll('a.attendee').forEach(element => {
    element.removeEventListener('click', onClick)
  })

  document.querySelector('#refresh').removeEventListener('click', onRefresh)

}

function render({ data }) {
  Log.info('- render({ data }) { ... }')
  Log.info(`-   data ...\n\n${Utilities.inspect(data)}\n\n`)

  let virtualContent = VirtualTemplate({
    'Is': Is,
    'attendance': data
  })

  // let progressElement = document.querySelector('#progress')
  //
  // if (progressElement) {
  //   progressElement.MDCLinearProgress.close()
  //   progressElement.MDCLinearProgress.destroy()
  // }

  if (!window.virtualContent) {
    document.querySelector('#index').appendChild(CreateContent(virtualContent))
  } else {
    Patch(document.querySelector('#index > div.attendance'), Diff(window.virtualContent, virtualContent))
  }

  // progressElement = document.querySelector('#progress')
  //
  // progressElement.MDCLinearProgress = new MDCLinearProgress(progressElement)
  // progressElement.MDCLinearProgress.close()

  window.virtualContent = virtualContent

}

async function onLoaded() {
  Log.info('- onLoaded() { ... }')

  let snackbarElement = document.querySelector('#snackbar')

  snackbarElement.MDCSnackbar = new MDCSnackbar(snackbarElement)

  try {
    render(await Request.get('/api/attendance'))
    bind()
  }
  catch (error) {
    showMessage(`An unknown error occurred refreshing the meeting (${error.message}).`)
  }

}

async function onRefresh() {
  Log.info('- onRefresh() { ... }')

  try {

    let response = null

    unbind()

    try {

      // let element = document.querySelector('#progress')
      // element.MDCLinearProgress.open()

      try {
        response = await Request.get('/api/attendance')
      }
      finally {
        // element.MDCLinearProgress.close()
      }

    }
    catch (error) {

      bind()

      throw error

    }

    render(response)
    bind()

  }
  catch (error) {
    showMessage(`An unknown error occurred refreshing the list of attendees (${error.message}).`)
  }

}

async function onClick(event) {
  Log.info('- onClick(event) { ... }')
  Log.info(`-   event.target.data-meeting-id=${event.target['data-meeting-id']}`)
  Log.info(`-   event.target.data-user-id=${event.target['data-user-id']}`)
  Log.info(`-   event.target.data-attended=${event.target['data-attended']}`)

  try {

    let response = null

    unbind()

    try {

      // let element = document.querySelector('#progress')
      // element.MDCLinearProgress.open()

      try {
        response = await Request.put('/api/attendance', {
          'meetingId': event.target['data-meeting-id'],
          'userId': event.target['data-user-id'],
          'attended': !event.target['data-attended']
        })
      }
      finally {
        // element.MDCLinearProgress.close()
      }

    }
    catch (error) {

      bind()

      throw error

    }

    render(response)
    bind()

  }
  catch (error) {
    showMessage(`An unknown error occurred updating the attendee (${error.message}).`)
  }

}
