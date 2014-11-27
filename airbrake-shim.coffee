# this == window
global = this

# Airbrake shim that stores exceptions until Airbrake notifier is loaded.
global.Airbrake = []

# Wraps passed function and returns new function that catches and
# reports unhandled exceptions.
global.Airbrake.wrap = (fn) ->
  if fn.__airbrake__
    return fn

  airbrakeWrapper = ->
    args = wrapArguments(arguments)
    try
      return fn.apply(this, args)
    catch exc
      args = Array.prototype.slice.call(arguments)
      global.Airbrake.push({error: exc, params: {arguments: args}})
      return null

  airbrakeWrapper.__airbrake__ = true
  airbrakeWrapper.__inner__ = fn

  for prop of fn
    if fn.hasOwnProperty(prop)
      airbrakeWrapper[prop] = fn[prop]

  return airbrakeWrapper

# Registers console reporter when notifier is ready.
global.Airbrake.onload = ->
  global.Airbrake.addReporter(global.Airbrake.consoleReporter)

# Reports unhandled exceptions.
global.onerror = (message, file, line, column, error) ->
  if message == 'Script error.'
    # Ignore.
    return

  if error
    global.Airbrake.push({error: error})
  else
    global.Airbrake.push({error: {
      message: message,
      fileName: file,
      lineNumber: line,
      columnNumber: column or 0,
    }})

loadAirbrakeNotifier = ->
  script = document.createElement('script')
  sibling = document.getElementsByTagName('script')[0]
  script.src = 'https://ssljscdn.airbrake.io/0.3/airbrake.min.js'
  script.async = true
  sibling.parentNode.insertBefore(script, sibling)

wrapArguments = (args) ->
  for arg, i in args
    type = typeof arg
    if type == 'function'
      args[i] = global.Airbrake.wrap(arg)
    else if arg && arg.length && type != 'string'
      # Wrap recursively.
      args[i] = wrapArguments(arg)
  return args

setupJQ = ->
  # Reports exceptions thrown in jQuery event handlers.
  jqEventAdd = jQuery.event.add
  jQuery.event.add = (elem, types, handler, data, selector) ->
    if handler.handler
      if not handler.handler.guid
        handler.handler.guid = jQuery.guid++
      handler.handler = global.Airbrake.wrap(handler.handler)
    else
      if not handler.guid
        handler.guid = jQuery.guid++
      handler = global.Airbrake.wrap(handler)
    return jqEventAdd(elem, types, handler, data, selector)

  # Reports exceptions thrown in jQuery callbacks.
  jqCallbacks = jQuery.Callbacks
  jQuery.Callbacks = (options) ->
    cb = jqCallbacks(options)
    cbAdd = cb.add
    cb.add = ->
      return cbAdd.apply(this, wrapArguments(arguments))
    return cb

  # Reports exceptions thrown in jQuery ready callbacks.
  jqReady = jQuery.fn.ready
  jQuery.fn.ready = (fn) ->
    return jqReady(global.Airbrake.wrap(fn))

# Asynchronously loads global.Airbrake notifier.
if global.addEventListener
  global.addEventListener('load', loadAirbrakeNotifier, false)
else if global.attachEvent
  global.attachEvent('onload', loadAirbrakeNotifier)

# Reports exceptions thrown in jQuery event handlers.
if global.jQuery
  setupJQ()
else
  console.warn('airbrake-js: jQuery not found; skipping jQuery instrumentation.');
