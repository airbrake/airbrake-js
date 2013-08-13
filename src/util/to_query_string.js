function toQueryString(obj) {
  var ret = [];

  function add(dest, key, val) {
    var type = Object.prototype.toString.call(val), i, len;

    if ("[object Array]" === type) {
      // Array
      for (i = 0, len = val.length; i < len; i++) { add(dest, key + "[]", val[i]); }
    } else if ("[object Object]" === type) {
      // Object
      for (i in val) { add(dest, key + "[" + i + "]", val[i]); }
    } else {
      // Strings and numbers
      key_to_encode = key;
      value_to_encode = val;
      dest.push(encodeURIComponent(key) + "=" + encodeURIComponent(val));
    }
  }

  for (var key in obj) { add(ret, key, obj[key]); }

  return ret.join("&");
}

module.exports = toQueryString;
