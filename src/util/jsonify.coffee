jsonify = (obj) ->
  seen = []
  return JSON.stringify obj, (k, v) ->
    if typeof v != 'object'
      return v
    if seen.indexOf(v) >= 0
      return '[Circular]'
    seen.push(v)
    return v


module.exports = jsonify
