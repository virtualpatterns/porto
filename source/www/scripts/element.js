import ElementTemplate from './element.pug'

const elementPrototype = Object.create({})

elementPrototype.bind = function() {
}

elementPrototype.unbind = function() {
}

elementPrototype.render = function() {
  return this.templateFn(this.state)
}

var Element = Object.create({})

Element.nextId = 0

Element.createElement = function(templateFn = ElementTemplate, prototype = elementPrototype) {

  var element = Object.create(prototype)

  element.state = {}
  element.state.id = `id_${Element.nextId ++}`
  element.templateFn = templateFn

  return element

}

Element.isElement = function(element) {
  return elementPrototype.isPrototypeOf(element)
}

Element.getElementPrototype = function() {
  return elementPrototype
}

export default Element
