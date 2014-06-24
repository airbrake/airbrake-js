truncate = (value, n=1000, depth=5) ->
  nn = 0
  keys = []
  seen = []

  getPath = (value)  ->
    index = seen.indexOf(value)
    path = [keys[index]]
    for i in [index..0]
      if seen[i] and seen[i][ path[0] ] == value
        value = seen[i]
        path.unshift(keys[i])
    return '~' + path.join('.')

  fn = (value, key='', dd=0) ->
    if value == null or value == undefined
      return value

    switch typeof value
      when 'boolean', 'number', 'string', 'function'
        return value
      when 'object'
        # continue
      else
        return String(value)

    if value instanceof Boolean or
       value instanceof Number or
       value instanceof String or
       value instanceof Date or
       value instanceof RegExp
      return value

    if seen.indexOf(value) >= 0
      return "[Circular #{getPath(value)}]"

    if dd >= depth
      return '[Truncated]'

    keys.push(key)
    seen.push(value)

    if Object.prototype.toString.apply(value) == '[object Array]'
      dst = []
      for el, i in value
        dst.push(fn(el, key=i, dd+1))
      return dst

    dst = {}
    for key of value
      if not Object.prototype.hasOwnProperty.call(value, key)
        continue

      nn++
      if nn >= n
        break

      # Ignore browser specific exceptions trying to read key (#79).
      try
        val = value[key]
      catch
        continue

      dst[key] = fn(val, key=key, dd+1)

    return dst

  return fn(value)


module.exports = truncate
