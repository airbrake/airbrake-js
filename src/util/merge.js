/* jshint -W084 */
/*
 * Merge a number of objects into one.
 *
 * Usage example:
 *  var obj1 = {
 *      a: 'a'
 *    },
 *    obj2 = {
 *      b: 'b'
 *    },
 *    obj3 = {
 *      c: 'c'
 *    },
 *    mergedObj = Util.merge(obj1, obj2, obj3);
 *
 * mergedObj is: {
 *   a: 'a',
 *   b: 'b',
 *   c: 'c'
 * }
 *
 */
var merge = (function() {
  function processProperty (key, dest, src) {
    if (src.hasOwnProperty(key)) {
      dest[key] = src[key];
    }
  }

  return function() {
    var objects = Array.prototype.slice.call(arguments),
      obj,
      key,
      result = {},
      i, l = objects.length;

    for (i = 0; i < l; i++) {
      obj = objects[i];
      if (obj) {
        for (key in obj) {
          processProperty(key, result, obj);
        }
      }
    }

    return result;
  };
}());

module.exports = merge;
