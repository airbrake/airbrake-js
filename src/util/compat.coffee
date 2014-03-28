if not Array.prototype.indexOf
  Array.prototype.indexOf = (obj, start) ->
    start = start or 0
    for i in [start...this.length]
      if this[i] == obj
        return i
    return -1
