import Element from '../element'

import TitleTemplate from './title.pug'

const elementPrototype = Element.getElementPrototype()
const titlePrototype = Object.create(elementPrototype)

var Title = Object.create(Element)

Title.createElement = function(templateFn = TitleTemplate, prototype = titlePrototype) {
  return Element.createElement.call(this, templateFn, prototype)
}

Title.isElement = function(title) {
  return titlePrototype.isPrototypeOf(title)
}

Title.getElementPrototype = function() {
  return titlePrototype
}

export default Title
