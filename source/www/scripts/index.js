import { Log } from 'mablung'

import Attendance from './elements/attendance'

const attendance = Attendance.createElement()

document.addEventListener('DOMContentLoaded', async () => {
  Log.info('- document.addEventListener(\'DOMContentLoaded\', async () => { ... }')
  await attendance.onRefreshed()
})

window.showOverlay = () => {
  Log.info('- window.showOverlay() { ... }')
  document.querySelector('div.p-overlay').classList.remove('p-overlay-hidden')
}

window.hideOverlay = () => {
  Log.info('- window.hideOverlay() { ... }')
  document.querySelector('div.p-overlay').classList.add('p-overlay-hidden')
}
