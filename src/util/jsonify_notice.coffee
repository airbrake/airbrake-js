truncate = (src, n=1000, depth=4) ->
  nn = 0
  dd = 0
  seen = []

  fn = (src, dd=0) ->
    return src if typeof src != 'object'

    return '[Circular]' if seen.indexOf(src) >= 0
    seen.push(src)

    return '[Circular]' if dd >= depth

    dst = {}
    for key of src
      if src.hasOwnProperty(key)
        nn++
        break if nn >= n
        dst[key] = fn(src[key], dd+1)
    return dst

  return fn(src)


jsonify = (notice) ->
  notice.params = truncate(notice.params)
  notice.environment = truncate(notice.environment)
  notice.session = truncate(notice.session)
  return JSON.stringify(notice)


module.exports = jsonify
