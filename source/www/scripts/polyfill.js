// For browsers that do not support Element.matches(), the following should suffice
// for most (if not all) practical cases (i.e. IE9+ support).

if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector
}
