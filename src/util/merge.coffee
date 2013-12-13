merge = ->
  objs = Array.prototype.slice.call(arguments)
  dst = objs.shift() or {}
  for obj in objs
    for key of obj
      if obj.hasOwnProperty(key)
        dst[key] = obj[key]
  return dst


module.exports = merge
