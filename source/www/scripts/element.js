import Create from 'virtual-dom/create-element'
import Diff from 'virtual-dom/diff'
import Patch from 'virtual-dom/patch'

const elementPrototype = Object.create({})

elementPrototype.getContent = function() {}

elementPrototype.render = function() {

  let content = this.getContent()

  if (!this.content) {
    this.queryParent().appendChild(Create(content))
    this.bind()
  } else {
    Patch(this.queryElement(), Diff(this.content, content))
  }

  this.content = content

}

elementPrototype.bind = function() {}

elementPrototype.unbind = function() {}

elementPrototype.queryParent = function() {
  return document.querySelector(this.parentSelector)
}

elementPrototype.queryElement = function() {
  return document.querySelector(`#${this.id}`)
}

elementPrototype.onElementRendered = function() {
  return document.querySelector(`#${this.id}`)
}

const Element = Object.create({})

Element.nextId = 0

Element.createElement = function(parentSelector, prototype = elementPrototype) {

  let element = Object.create(prototype)

  element.id = `id_${Element.nextId ++}`
  element.parentSelector = parentSelector
  // element.state = {}

  return element

}

Element.isElement = function(element) {
  return elementPrototype.isPrototypeOf(element)
}

Element.getElementPrototype = function() {
  return elementPrototype
}

export default Element
