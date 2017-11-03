import Element from '../element'
// import { Log } from 'mablung'

import ContentFn from './template.pug'

const elementPrototype = Element.getElementPrototype()
const templatePrototype = Object.create(elementPrototype)

templatePrototype.getContent = function(data = {}) {
  // Log.debug('- templatePrototype.getContent(data) { ... }')
  return this.contentFn(Object.assign({}, data, { 'element': this }))
}

const Template = Object.create(Element)

Template.createElement = function(parentSelector, contentFn = ContentFn, prototype = templatePrototype) {

  let element = Element.createElement.call(this, parentSelector, prototype)

  // element.setState({ 'element': element })
  element.contentFn = contentFn

  return element

}

Template.isElement = function(template) {
  return templatePrototype.isPrototypeOf(template)
}

Template.getElementPrototype = function() {
  return templatePrototype
}

export default Template
