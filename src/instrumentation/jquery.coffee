instrumentJQuery = (client, jq=global.jQuery) ->
  wrapArguments = (args) ->
    for arg, i in args
      type = typeof arg
      if type == 'function'
        args[i] = client.wrap(arg)
      else if arg && arg.length && type != 'string'
        # Wrap recursively.
        args[i] = wrapArguments(arg)
    return args

  # Reports exceptions thrown in jQuery event handlers.
  jqEventAdd = jq.event.add
  jq.event.add = (elem, types, handler, data, selector) ->
    if handler.handler
      if not handler.handler.guid
        handler.handler.guid = jq.guid++
      handler.handler = client.wrap(handler.handler)
    else
      if not handler.guid
        handler.guid = jq.guid++
      handler = client.wrap(handler)
    return jqEventAdd(elem, types, handler, data, selector)

  # Reports exceptions thrown in jQuery callbacks.
  jqCallbacks = jq.Callbacks
  jq.Callbacks = (options) ->
    cb = jqCallbacks(options)
    cbAdd = cb.add
    cb.add = ->
      return cbAdd.apply(this, wrapArguments(arguments))
    return cb

  # Reports exceptions thrown in jQuery ready callbacks.
  jqReady = jq.fn.ready
  jq.fn.ready = (fn) ->
    return jqReady(client.wrap(fn))

  return jq


module.exports = instrumentJQuery
