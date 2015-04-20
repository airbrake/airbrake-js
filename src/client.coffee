require('./internal/compat')
merge = require('./internal/merge')
Promise = require('./internal/promise')


class Client
  constructor: (opts={}) ->
    @_projectId = opts.projectId || 0
    @_projectKey = opts.projectKey || ''

    @_host = 'https://api.airbrake.io'

    @_context = {}
    @_params = {}
    @_env = {}
    @_session = {}

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
        reporter = require('./reporters/xhr')
      else
        reporter = require('./reporters/jsonp')
      @addReporter(reporter)

  setProject: (id, key) ->
    @_projectId = id
    @_projectKey = key

  setHost: (host) ->
    @_host = host

  addContext: (context) ->
    merge(@_context, context)

  setEnvironmentName: (envName) ->
    @_context.environment = envName

  addParams: (params) ->
    merge(@_params, params)

  addEnvironment: (env) ->
    merge(@_env, env)

  addSession: (session) ->
    merge(@_session, session)

  addReporter: (reporter) ->
    @_reporters.push(reporter)

  addFilter: (filter) ->
    @_filters.push(filter)

  push: (err) ->
    defContext = {
      language: 'JavaScript',
      sourceMapEnabled: true
    }
    if global.navigator?.userAgent
      defContext.userAgent = global.navigator.userAgent
    if global.location
      defContext.url = String(global.location)

    promise = new Promise()

    @_processor err.error or err, (processorName, errInfo) =>
      notice =
        notifier:
          name: 'airbrake-js-' + processorName
          version: '<%= pkg.version %>'
          url: 'https://github.com/airbrake/airbrake-js'
        errors: [errInfo]
        context: merge(defContext, @_context, err.context)
        params: merge({}, @_params, err.params)
        environment: merge({}, @_env, err.environment)
        session: merge({}, @_session, err.session)

      for filterFn in @_filters
        if not filterFn(notice)
          return

      opts = {projectId: @_projectId, projectKey: @_projectKey, host: @_host}
      for reporterFn in @_reporters
        reporterFn(notice, opts, promise)

      return

    return promise


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
        self.push({error: exc, params: {arguments: args}})
        return null

    for prop of fn
      if fn.hasOwnProperty(prop)
        airbrakeWrapper[prop] = fn[prop]

    airbrakeWrapper.__airbrake__ = true
    airbrakeWrapper.__inner__ = fn

    return airbrakeWrapper


module.exports = Client
