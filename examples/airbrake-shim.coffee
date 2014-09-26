# Airbrake shim that stores exceptions until Airbrake notifier is loaded.
window.Airbrake = []

# Wraps passed function and returns new function that catches and
# reports unhandled exceptions.
Airbrake.wrap = (fn) ->
  if fn.__airbrake__
    return fn

  airbrakeWrapper = ->
    try
      return fn.apply(this, arguments)
    catch exc
      args = Array.prototype.slice.call(arguments)
      Airbrake.push({error: exc, params: {arguments: args}})

  for prop of fn
    if fn.hasOwnProperty(prop)
      airbrakeWrapper[prop] = fn[prop]

  airbrakeWrapper.__airbrake__ = true
  airbrakeWrapper.__inner__ = fn

  return airbrakeWrapper

# Registers console reporter when notifier is ready.
Airbrake.onload = ->
  Airbrake.addReporter(Airbrake.consoleReporter)

# Reports unhandled exceptions.
window.onerror = (message, file, line, column, error) ->
  if message == 'Script error.'
    # Ignore.
    return

  if error
    Airbrake.push({error: error})
  else
    Airbrake.push({error: {
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

setupJQ = ->
  # Reports exceptions thrown in jQuery event handlers.
  jqEventAdd = jQuery.event.add
  jQuery.event.add = (elem, types, handler, data, selector) ->
    if handler.handler
      if not handler.handler.guid
        handler.handler.guid = jQuery.guid++
      handler.handler = Airbrake.wrap(handler.handler)
    else
      if not handler.guid
        handler.guid = jQuery.guid++
      handler = Airbrake.wrap(handler)
    return jqEventAdd(elem, types, handler, data, selector)

  # Reports exceptions thrown in jQuery callbacks.
  jqCallbacks = jQuery.Callbacks
  jQuery.Callbacks = (options) ->
    cb = jqCallbacks(options)
    cbAdd = cb.add
    cb.add = ->
      fns = arguments
      jQuery.each fns, (i, fn) ->
        if jQuery.isFunction(fn)
          fns[i] = Airbrake.wrap(fn)
      return cbAdd.apply(this, fns)
    return cb

  # Reports exceptions thrown in jQuery ready callbacks.
  jqReady = jQuery.fn.ready
  jQuery.fn.ready = (fn) ->
    return jqReady(Airbrake.wrap(fn))

# Asynchronously loads Airbrake notifier.
if window.addEventListener
  window.addEventListener('load', loadAirbrakeNotifier, false)
else
  window.attachEvent('onload', loadAirbrakeNotifier)

# Reports exceptions thrown in jQuery event handlers.
if window.jQuery
  setupJQ()
else
  console.warn('airbrake: jQuery not found; skipping jQuery instrumentation.');
