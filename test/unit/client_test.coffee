import Client from '../../src/client'


describe 'window.onerror', ->
  [onerror, client] = []

  beforeEach ->
    onerror = window.onerror
    window.onerror = null
    client = new Client()

  afterEach ->
    window.onerror = onerror

  it 'is setup', ->
    expect(global.onerror).to.equal(client.onerror)


describe 'Client', ->
  processor = null
  reporter = null
  client = null

  beforeEach ->
    processor = sinon.spy (data, cb) ->
      cb('test-processor', data)
    reporter = sinon.spy (_, __, promise) ->
      promise.resolve({id: 1})
    client = new Client(processor: processor, reporter: reporter)

  describe 'filter', ->
    it 'returns null to ignore notice', ->
      filter = sinon.spy -> null
      client.addFilter(filter)

      client.notify({})

      expect(filter).to.have.been.called
      expect(reporter).not.to.have.been.called

    it 'returns true to keep notice', ->
      filter = sinon.spy (notice) -> true
      client.addFilter(filter)

      client.notify(error: {})

      expect(filter).to.have.been.called
      expect(reporter).to.have.been.called

    it 'returns notice to change payload', ->
      filter = sinon.spy (notice) ->
        notice.context.environment = 'production'
        return notice
      client.addFilter(filter)

      client.notify(error: {})

      expect(filter).to.have.been.called
      notice = reporter.lastCall.args[0]
      expect(notice.context.environment).to.equal('production')

    it 'returns new notice', ->
      newNotice = {errors: []}
      filter = sinon.spy (notice) ->
        return newNotice
      client.addFilter(filter)

      client.notify(error: {})

      expect(filter).to.have.been.called
      notice = reporter.lastCall.args[0]
      expect(notice).to.equal(newNotice)

  describe '"Script error" message', ->
    it 'is filtered', ->
      client.notify(error: {message: 'Script error'})

      expect(reporter).to.not.have.been.called

  context '"Uncaught ..." error message', ->
    beforeEach ->
      msg = 'Uncaught SecurityError: Blocked a frame with origin "https://airbrake.io" from accessing a cross-origin frame.'
      client.notify(error: {type: '', message: msg})

    it 'splitted into type and message', ->
      expect(reporter).to.have.been.called
      notice = reporter.lastCall.args[0]
      err = notice.errors[0]
      expect(err.type).to.equal('SecurityError')
      expect(err.message).to.equal('Blocked a frame with origin "https://airbrake.io" from accessing a cross-origin frame.')

  describe 'Angular error message', ->
    beforeEach ->
      msg = "[$injector:undef] Provider '$exceptionHandler' must return a value from $get factory method. http://errors.angularjs.org/1.4.3/$injector/undef?p0=%24exceptionHandler"
      client.notify(error: {type: '', message: msg})

    it 'splitted into type and message', ->
      expect(reporter).to.have.been.called
      notice = reporter.lastCall.args[0]
      err = notice.errors[0]
      expect(err.type).to.equal('$injector:undef')
      expect(err.message).to.equal("Provider '$exceptionHandler' must return a value from $get factory method. http://errors.angularjs.org/1.4.3/$injector/undef?p0=%24exceptionHandler")

  describe "notify", ->
    exception = do ->
      error = undefined
      try
        (0)()
      catch _err
        error = _err
      return error

    it "returns promise and resolves it", ->
      promise = client.notify(exception)
      onResolved = sinon.spy()
      promise.then(onResolved)
      expect(onResolved).to.have.been.called

    describe "with error", ->
      it "processor is called", ->
        client.notify(exception)

        expect(processor).to.have.been.called

      it "reporter is called with valid options", ->
        client.setProject(999, "custom_project_key")
        client.notify(exception)

        expect(reporter).to.have.been.called
        opts = reporter.lastCall.args[1]
        expect(opts).to.deep.equal({
          projectId: 999
          projectKey: "custom_project_key"
          host: "https://api.airbrake.io"
          timeout: 10000
        })

      it "reporter is called with custom host", ->
        client.setHost("https://custom.domain.com")
        client.notify(exception)

        reported = reporter.lastCall.args[1]
        expect(reported.host).to.equal("https://custom.domain.com")

    describe "custom data sent to reporter", ->
      it "reports context", ->
        client.addFilter (n) ->
          n.context.context_key = "[custom_context]"
          return n
        client.notify(exception)

        reported = reporter.lastCall.args[0]
        expect(reported.context.context_key).to.equal("[custom_context]")

      it "reports environment", ->
        client.addFilter (n) ->
          n.environment.env_key = "[custom_env]"
          return n
        client.notify(exception)

        reported = reporter.lastCall.args[0]
        expect(reported.environment.env_key).to.equal("[custom_env]")

      it "reports params", ->
        client.addFilter (n) ->
          n.params.params_key = "[custom_params]"
          return n
        client.notify(exception)

        reported = reporter.lastCall.args[0]
        expect(reported.params.params_key).to.equal("[custom_params]")

      it "reports session", ->
        client.addFilter (n) ->
          n.session.session_key = "[custom_session]"
          return n
        client.notify(exception)

        reported = reporter.lastCall.args[0]
        expect(reported.session.session_key).to.equal("[custom_session]")

      describe "wrapped error", ->
        it "unwraps and processes error", ->
          client.notify(error: exception)
          expect(processor).to.have.been.calledWith(exception)

        it "reports custom context", ->
          client.addFilter (n) ->
            n.context.context1 = "value1"
            n.context.context2 = "value2"
            return n

          client.notify
            error: exception
            context:
              context1: "notify_value1"
              context3: "notify_value3"

          reported = reporter.lastCall.args[0]
          expect(reported.context.context1).to.equal('value1')
          expect(reported.context.context2).to.equal('value2')
          expect(reported.context.context3).to.equal('notify_value3')

        it "reports custom environment", ->
          client.addFilter (n) ->
            n.environment.env1 = "value1"
            n.environment.env2 = "value2"
            return n

          client.notify
            error: exception
            environment:
              env1: "notify_value1"
              env3: "notify_value3"

          reported = reporter.lastCall.args[0]
          expect(reported.environment).to.deep.equal
            env1: "value1"
            env2: "value2"
            env3: "notify_value3"

        it "reports custom params", ->
          client.addFilter (n) ->
            n.params.param1 = "value1"
            n.params.param2 = "value2"
            return n

          client.notify
            error: exception
            params:
              param1: "notify_value1"
              param3: "notify_value3"

          params = reporter.lastCall.args[0].params
          expect(params.param1).to.equal('value1')
          expect(params.param2).to.equal('value2')
          expect(params.param3).to.equal('notify_value3')

        it "reports custom session", ->
          client.addFilter (n) ->
            n.session.session1 = "value1"
            n.session.session2 = "value2"
            return n

          client.notify
            error: exception
            session:
              session1: "notify_value1"
              session3: "notify_value3"

          reported = reporter.lastCall.args[0]
          expect(reported.session).to.deep.equal
            session1: "value1"
            session2: "value2"
            session3: "notify_value3"

    describe 'with location', ->
      notice = null

      beforeEach ->
        client.notify(exception)
        expect(reporter).to.have.been.called
        notice = reporter.lastCall.args[0]

      it 'reports context.url', ->
        expect(notice.context.url).to.equal('http://localhost:9876/context.html')

      it 'reports context.rootDirectory', ->
        expect(notice.context.rootDirectory).to.equal('http://localhost:9876')

  describe "custom reporter", ->
    it "is called on error", ->
      custom_reporter = sinon.spy()
      client.addReporter(custom_reporter)
      client.notify(error: {})
      expect(custom_reporter).to.have.been.called

  describe "wrap", ->
    it "does not invoke function immediately", ->
      fn = sinon.spy()
      client.wrap(fn)
      expect(fn).not.to.have.been.called

    it "creates wrapper that invokes function with passed args", ->
      fn = sinon.spy()
      wrapper = client.wrap(fn)
      wrapper("hello", "world")
      expect(fn).to.have.been.called
      expect(fn.lastCall.args).to.deep.equal(["hello", "world"])

    it "sets __airbrake__ and __inner__ properties", ->
      fn = sinon.spy()
      wrapper = client.wrap(fn)
      expect(wrapper.__airbrake__).to.equal(true)
      expect(wrapper.__inner__).to.equal(fn)

    it "copies function properties", ->
      fn = sinon.spy()
      fn.prop = "hello"
      wrapper = client.wrap(fn)
      expect(wrapper.prop).to.equal("hello")

    it "reports throwed exception", ->
      client.notify = sinon.spy()
      exc = new Error("test")
      fn = ->
        throw exc
      wrapper = client.wrap(fn)
      try
        wrapper("hello", "world")
      catch err
        # ignore

      expect(client.notify).to.have.been.called
      expect(client.notify.lastCall.args).to.deep.equal([{error: exc, params: {arguments: ["hello", "world"]}}])

    it "wraps arguments", ->
      fn = sinon.spy()
      wrapper = client.wrap(fn)
      arg1 = ->
      wrapper(arg1)
      expect(fn).to.have.been.called
      arg1Wrapper = fn.lastCall.args[0]
      expect(arg1Wrapper.__airbrake__).to.equal(true)
      expect(arg1Wrapper.__inner__).to.equal(arg1)

  describe 'call', ->
    it 'reports throwed exception', ->
      client.notify = sinon.spy()
      exc = new Error("test")
      fn = ->
        throw exc
      try
        client.call(fn, "hello", "world")
      catch err
        # ignore

      expect(client.notify).to.have.been.called
      expect(client.notify.lastCall.args).to.deep.equal([{error: exc, params: {arguments: ["hello", "world"]}}])

  it 'reports log history', ->
    for i in [0..15]
      console.log(i)
    client.notify(new Error('test'))

    expect(reporter).to.have.been.called
    notice = reporter.lastCall.args[0]
    expect(notice.context.history).to.deep.equal([
      {type: 'log', arguments: [6]},
      {type: 'log', arguments: [7]},
      {type: 'log', arguments: [8]},
      {type: 'log', arguments: [9]},
      {type: 'log', arguments: [10]},
      {type: 'log', arguments: [11]},
      {type: 'log', arguments: [12]},
      {type: 'log', arguments: [13]},
      {type: 'log', arguments: [14]},
      {type: 'log', arguments: [15]},
    ])
