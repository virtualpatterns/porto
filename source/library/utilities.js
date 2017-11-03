import { Log } from 'mablung'
import _Utilities from 'nessa/library/utilities'

const Utilities = Object.create(_Utilities)

Utilities.createElement = function (element, attributes, children) {
  Log.debug('- Utilities.createElement(element, attributes, children) { ... }')
  Log.inspect('attributes', attributes)

  return _Utilities.createElement.call(this, element, attributes, children)

}

export default Utilities
