function isEmpty(value) {
  return isObject(value) && Object.keys(value).length === 0;
}

function isArray(a) {
  return !!a && a.constructor === Array;
}

function isObject(a) {
  return !!a && a.constructor === Object;
}

function isString(a) {
  return typeof a === 'string' || a instanceof String;
}
module.exports = {
  isEmpty,
  isArray,
  isObject,
  isString,
};
