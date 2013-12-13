# The Client is the entry point to interacting with the Airbrake JS library.
# It stores configuration information and handles exceptions provided to it.
#
# It generates a Processor and a Reporter for each exception and uses them
# to transform an exception into data, and then to transport that data.
#
# window.Airbrake is an instance of Client.

merge = require './util/merge'


class Client
  constructor: (processor, reporter) ->
    @_projectId = 0
    @_projectKey = ''

    @_context = {}
    @_params = {}
    @_env = {}
    @_session = {}

    @_processor = processor
    @_reporters = []
    @_filters = []

    if reporter
      @addReporter(reporter)

  setProject: (id, key) ->
    @_projectId = id
    @_projectKey = key

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

  push: (notice) ->
    defContext = language: 'JavaScript'
    if global.navigator?.userAgent
      defContext.userAgent = global.navigator.userAgent
    if global.location
      defContext.url = String(global.location)

    @_processor notice.error || notice, (name, errInfo) =>
      notice =
        notifier:
          name: 'Airbrake JS ' + name
          version: '<%= pkg.version %>'
          url: 'https://github.com/airbrake/airbrake-js'
        errors: [errInfo]
        context: merge(defContext, @_context, notice.context)
        params: merge({}, @_params, notice.params)
        environment: merge({}, @_env, notice.environment)
        session: merge({}, @_session, notice.session)

      for filterFn in @_filters
        if not filterFn(notice)
          return

      for reporterFn in @_reporters
        reporterFn(notice, {projectId: @_projectId, projectKey: @_projectKey})

      return

  wrap: (fn) ->
    return ->
      try
        return fn.apply this, arguments
      catch exc
        Airbrake.push exc
        throw exc

module.exports = Client
