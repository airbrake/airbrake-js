require('./internal/compat')
merge = require('./internal/merge')
Promise = require('./internal/promise')


# Creates window.onerror handler for notifier. See
# https://developer.mozilla.org/en/docs/Web/API/GlobalEventHandlers/onerror.
makeOnErrorHandler = (notifier) ->
  (message, file, line, column, error) ->
    if error
      notifier.notify(error)
    else
      notifier.notify({error: {
        message: message,
        fileName: file,
        lineNumber: line,
        columnNumber: column or 0,
      }})


class Client
  constructor: (opts={}) ->
    @_projectId = opts.projectId || 0
    @_projectKey = opts.projectKey || ''

    @_host = opts.host || 'https://api.airbrake.io'

    @_processor = null
    @_reporters = []
    @_filters = []

    if opts.processor != undefined
      @_processor = opts.processor
    else
      @_processor = require('./processors/stack')

    if opts.reporter != undefined
      @addReporter(opts.reporter)
    else
      if 'withCredentials' of new global.XMLHttpRequest()
        reporter = 'compat'
      else
        reporter = 'jsonp'
      @addReporter(reporter)

    @addFilter(require('./internal/script_error_filter'))

    @onerror = makeOnErrorHandler(this)
    if not global.onerror? and opts.onerror != false
      global.onerror = @onerror

  setProject: (id, key) ->
    @_projectId = id
    @_projectKey = key

  setHost: (host) ->
    @_host = host

  # Deprecated. Use addFilter.
  addContext: (context) ->
    console?.warn?('airbrake: addContext is deprecated, please use addFilter')
    @addFilter (notice) ->
      notice.context = merge({}, context, notice.context)
      return notice

  # Deprecated. Use addFilter.
  setEnvironmentName: (envName) ->
    console?.warn?('airbrake: setEnvironmentName is deprecated, please use addFilter')
    @addFilter (notice) ->
      if not notice.context.environment?
        notice.context.environment = envName
      return notice

  # Deprecated. Use addFilter.
  addParams: (params) ->
    console?.warn?('airbrake: addParams is deprecated, please use addFilter')
    @addFilter (notice) ->
      notice.params = merge({}, params, notice.params)
      return notice

  # Deprecated. Use addFilter.
  addEnvironment: (env) ->
    console?.warn?('airbrake: addEnvironment is deprecated, please use addFilter')
    @addFilter (notice) ->
      notice.environment = merge({}, env, notice.environment)
      return notice

  # Deprecated. Use addFilter.
  addSession: (session) ->
    console?.warn?('airbrake: addSession is deprecated, please use addFilter')
    @addFilter (notice) ->
      notice.session = merge({}, session, notice.session)
      return notice

  addReporter: (reporter) ->
    switch reporter
      when 'compat'
        reporter = require('./reporters/compat')
      when 'xhr'
        reporter = require('./reporters/xhr')
      when 'jsonp'
        reporter = require('./reporters/jsonp')
    @_reporters.push(reporter)

  addFilter: (filter) ->
    @_filters.push(filter)

  notify: (err) ->
    defContext = {
      language: 'JavaScript'
      sourceMapEnabled: true
    }
    if global.navigator?.userAgent
      defContext.userAgent = global.navigator.userAgent
    if global.location
      defContext.url = String(global.location)
      # Set root directory to group errors on different subdomains together.
      defContext.rootDirectory = global.location.protocol + '//' + global.location.host

    promise = new Promise()

    @_processor err.error or err, (processorName, errInfo) =>
      notice =
        errors: [errInfo]
        context: merge(defContext, err.context)
        params: err.params or {}
        environment: err.environment or {}
        session: err.session or {}

      notice.context.notifier =
        name: 'airbrake-js-' + processorName
        version: '<%= pkg.version %>'
        url: 'https://github.com/airbrake/airbrake-js'

      for filterFn in @_filters
        n = filterFn(notice)
        if n == null or n == false
          return
        # TODO: remove this check in new major version.
        if n.errors? # Check if this is a notice.
          notice = n
        else
          console?.warn?('airbrake: filter must return notice or null to ignore the notice')

      opts = {projectId: @_projectId, projectKey: @_projectKey, host: @_host}
      for reporterFn in @_reporters
        reporterFn(notice, opts, promise)

      return

    return promise

  # Deprecated. Use notify instead.
  push: (err) ->
    console?.warn?('airbrake: push is deprecated, please use notify')
    @notify(err)

  _wrapArguments: (args) ->
    for arg, i in args
      if typeof arg == 'function'
        args[i] = @wrap(arg)
    return args

  wrap: (fn) ->
    if fn.__airbrake__
      return fn

    self = this

    airbrakeWrapper = ->
      args = self._wrapArguments(arguments)
      try
        return fn.apply(this, args)
      catch exc
        args = Array.prototype.slice.call(arguments)
        self.notify({error: exc, params: {arguments: args}})
        return

    for prop of fn
      if fn.hasOwnProperty(prop)
        airbrakeWrapper[prop] = fn[prop]

    airbrakeWrapper.__airbrake__ = true
    airbrakeWrapper.__inner__ = fn

    return airbrakeWrapper


module.exports = Client
