/*
 * Fill 'text' pattern with 'data' values.
 *
 * e.g. Utils.substitute('<{tag}></{tag}>', {tag: 'div'}, true) will return '<div></div>'
 *
 * emptyForUndefinedData - a flag, if true, all matched {<name>} without data.<name> value specified will be
 * replaced with empty string.
 */
var substitute = function(text, data, emptyForUndefinedData) {
  return text.replace(/\{([\w_.\-]+)\}/g, function(match, key) {
    return (key in data) ? data[key] : (emptyForUndefinedData ? '' : match);
  });
};

/*
 * Perform pattern rendering for an array of data objects.
 * Returns a concatenation of rendered strings of all objects in array.
 */
var substituteArr = function(text, dataArr, emptyForUndefinedData) {
  var _i = 0, _l = 0,
    returnStr = '';

  for (_i = 0, _l = dataArr.length; _i < _l; _i += 1) {
    returnStr += substitute(text, dataArr[_i], emptyForUndefinedData);
  }

  return returnStr;
};

module.exports = {
  substitute: substitute,
  substituteArr: substituteArr
};
