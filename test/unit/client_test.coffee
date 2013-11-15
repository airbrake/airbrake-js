chai       = require("chai")
sinon      = require("sinon")
sinon_chai = require("sinon-chai")
expect     = chai.expect
chai.use(sinon_chai)

Client = require("../../src/client")

describe "Client", ->
  describe "environmentName", ->
    it "is \"environment\" by default", ->
      client = new Client()
      expect(client.getEnvironmentName()).to.equal("environment")

    it "can be set and read", ->
      client = new Client()
      client.setEnvironmentName("[custom_environment]")
      expect(client.getEnvironmentName()).to.equal("[custom_environment]")

  it "can set and read `project`", ->
    client = new Client()
    client.setProject("[custom_project_id]", "[custom_key]")
    expect(client.getProject()).to.deep.equal([ "[custom_project_id]", "[custom_key]" ])

  describe "addContext", ->
    it "can be set and read", ->
      client = new Client()
      client.addContext(key1: "[custom_context_key1_value]")
      expect(client.getContext().key1).to.equal("[custom_context_key1_value]")

    it "overrides previously set key", ->
      client = new Client()
      client.addContext(key1: "[custom_context_key1_value]")
      client.addContext(key1: "[custom_context_key1_value2]")
      expect(client.getContext().key1).to.equal("[custom_context_key1_value2]")

    it "preserves unspecified keys", ->
      client = new Client()
      client.addContext(key1: "[custom_context_key1_value]")
      client.addContext(key2: "[custom_context_key1_value2]")
      expect(client.getContext().key1).to.equal("[custom_context_key1_value]")

  describe "addEnv", ->
    it "can be set and read", ->
      client = new Client()
      client.addEnv(key1: "[custom_env_key1_value]")
      expect(client.getEnv().key1).to.equal("[custom_env_key1_value]")

    it "overrides previously set key", ->
      client = new Client()
      client.addEnv(key1: "[custom_env_key1_value]")
      client.addEnv(key1: "[custom_env_key1_value2]")
      expect(client.getEnv().key1).to.equal("[custom_env_key1_value2]")

    it "preserves unspecified keys", ->
      client = new Client()
      client.addEnv(key1: "[custom_env_key1_value]")
      client.addEnv(key2: "[custom_env_key1_value2]")
      expect(client.getEnv().key1).to.equal("[custom_env_key1_value]")

  describe "addParams", ->
    it "can be set and read", ->
      client = new Client()
      client.addParams(key1: "[custom_params_key1_value]")
      expect(client.getParams().key1).to.equal("[custom_params_key1_value]")

    it "overrides previously set key", ->
      client = new Client()
      client.addParams(key1: "[custom_params_key1_value]")
      client.addParams(key1: "[custom_params_key1_value2]")
      expect(client.getParams().key1).to.equal("[custom_params_key1_value2]")

    it "preserves unspecified keys", ->
      client = new Client()
      client.addParams(key1: "[custom_params_key1_value]")
      client.addParams(key2: "[custom_params_key1_value2]")
      expect(client.getParams().key1).to.equal("[custom_params_key1_value]")

  describe "addSession", ->
    it "can be set and read", ->
      client = new Client()
      client.addSession(key1: "[custom_session_key1_value]")
      expect(client.getSession().key1).to.equal("[custom_session_key1_value]")

    it "overrides previously set key", ->
      client = new Client()
      client.addSession(key1: "[custom_session_key1_value]")
      client.addSession(key1: "[custom_session_key1_value2]")
      expect(client.getSession().key1).to.equal("[custom_session_key1_value2]")

    it "preserves unspecified keys", ->
      client = new Client()
      client.addSession(key1: "[custom_session_key1_value]")
      client.addSession(key2: "[custom_session_key1_value2]")
      expect(client.getSession().key1).to.equal("[custom_session_key1_value]")

  describe "capture", ->
    exception = do ->
      error = undefined
      try
        (0)()
      catch _err
        error = _err

      return error

    it "is aliased as push", ->
      client = new Client()
      expect(client.push).to.equal(client.capture)

    describe "with captured calls to processor", ->
      it "processes with processor", ->
        processor = { process: sinon.spy() }
        reporter = { report: sinon.spy() }
        getProcessor = -> processor
        getReporter = -> reporter

        client = new Client(getProcessor, getReporter)
        client.capture(exception)

        expect(processor.process).to.have.been.called

      it "reports with reporter", ->
        processor = { process: sinon.spy() }
        reporter = { report: sinon.spy() }
        getReporter = -> reporter
        getProcessor = -> processor

        client = new Client(getProcessor, getReporter)
        client.capture(exception)

        # Reporter is not called until Processor invokes the
        # callback provided
        expect(reporter.report).not.to.have.been.called

        # The first argument passed the processor is the error to be handled
        # The second is the continuation handed off to the reporter
        continueFromProcessor = processor.process.lastCall.args[1]
        processed_error = sinon.spy()
        continueFromProcessor(processed_error)

        expect(reporter.report).to.have.been.calledWith(processed_error)

      it "ignores errors thrown by processor", ->
        processor = { process: -> throw(new Error("Processor Error")) }
        reporter = { report: sinon.spy() }
        getProcessor = -> processor
        getReporter = -> reporter
        client = new Client(getProcessor, getReporter)

        run = -> client.capture(exception)
        expect(run).not.to.throw()

      it "ignores errors thrown by reporter", ->
        processor = { process: sinon.spy() }
        reporter = { report: -> throw(new Error("Reporter Error")) }
        getProcessor = -> processor
        getReporter = -> reporter
        client = new Client(getProcessor, getReporter)

        run = -> client.capture(exception)
        expect(run).not.to.throw()

    describe "custom data sent to reporter", ->
      it "reports context", ->
        reporter = { report: sinon.spy() }
        processor = { process: (data, fn) -> fn(data) }
        getReporter = -> reporter
        getProcessor = -> processor

        client = new Client(getProcessor, getReporter)
        client.addContext(context_key: "[custom_context]")
        client.capture(exception)

        reported = reporter.report.lastCall.args[0]
        expect(reported.context.context_key).to.equal("[custom_context]")

      it "reports env", ->
        reporter = { report: sinon.spy() }
        processor = { process: (data, fn) -> fn(data) }
        getReporter = -> reporter
        getProcessor = -> processor

        client = new Client(getProcessor, getReporter)
        client.addEnv(env_key: "[custom_env]")
        client.capture(exception)

        reported = reporter.report.lastCall.args[0]
        expect(reported.env.env_key).to.equal("[custom_env]")

      it "reports params", ->
        reporter = { report: sinon.spy() }
        processor = { process: (data, fn) -> fn(data) }
        getReporter = -> reporter
        getProcessor = -> processor

        client = new Client(getProcessor, getReporter)
        client.addParams(params_key: "[custom_params]")
        client.capture(exception)

        reported = reporter.report.lastCall.args[0]
        expect(reported.params.params_key).to.equal("[custom_params]")

      it "reports session", ->
        reporter = { report: sinon.spy() }
        processor = { process: (data, fn) -> fn(data) }
        getReporter = -> reporter
        getProcessor = -> processor

        client = new Client(getProcessor, getReporter)
        client.addSession(session_key: "[custom_session]")
        client.capture(exception)

        reported = reporter.report.lastCall.args[0]
        expect(reported.session.session_key).to.equal("[custom_session]")

      describe "wrapped error", ->
        it "unwraps and processes error", ->
          reporter = { report: sinon.spy() }
          processor = { process: sinon.spy() }
          getReporter = -> reporter
          getProcessor = -> processor

          client = new Client(getProcessor, getReporter)
          client.capture(error: exception)
          expect(processor.process).to.have.been.calledWith(exception)

        it "reports custom context", ->
          reporter = { report: sinon.spy() }
          processor = { process: (error, fn) -> fn({}) }
          getReporter = -> reporter
          getProcessor = -> processor

          client = new Client(getProcessor, getReporter)
          client.capture(error: exception, context: { flavor: 'banana' })
          expect(reporter.report).to.have.been.calledWithMatch(context: { flavor: 'banana' })

        it "reports custom env", ->
          reporter = { report: sinon.spy() }
          processor = { process: (error, fn) -> fn({}) }
          getReporter = -> reporter
          getProcessor = -> processor

          client = new Client(getProcessor, getReporter)
          client.capture(error: exception, env: { landmark: 'Metolius' })
          expect(reporter.report).to.have.been.calledWithMatch(env: { landmark: 'Metolius' })

        it "reports custom params", ->
          reporter = { report: sinon.spy() }
          processor = { process: (error, fn) -> fn({}) }
          getReporter = -> reporter
          getProcessor = -> processor

          client = new Client(getProcessor, getReporter)
          client.capture(error: exception, params: { action: 'show' })
          expect(reporter.report).to.have.been.calledWithMatch(params: { action: 'show' })

        it "reports custom session", ->
          reporter = { report: sinon.spy() }
          processor = { process: (error, fn) -> fn({}) }
          getReporter = -> reporter
          getProcessor = -> processor

          client = new Client(getProcessor, getReporter)
          client.capture(error: exception, session: { username: 'jbr' })
          expect(reporter.report).to.have.been.calledWithMatch(session: { username: 'jbr' })

        it "reports to custom reporter", ->
          custom_reporter = sinon.spy()
          processed_error = sinon.spy()
          getReporter = -> { report: -> }
          getProcessor = -> { process: (error, fn) -> fn(processed_error) }
          client = new Client(getProcessor, getReporter)
          client.addReporter(custom_reporter)
          client.capture(error: exception)
          expect(custom_reporter).to.have.been.calledWith(processed_error)

  describe "data supplied by shim", ->
    setTimeout = undefined

    beforeEach -> setTimeout = sinon.spy(global, 'setTimeout')
    afterEach -> setTimeout.restore()

    it "processes extant errors", ->
      processor = { process: sinon.spy() }
      getProcessor = -> processor
      getReporter = -> { report: -> }
      client = new Client(getProcessor, getReporter, [ "extant error" ])
      deferredFunction = setTimeout.lastCall.args[0]
      deferredFunction()
      expect(processor.process).to.have.been.calledWith("extant error")

    it "acquires custom reporters from shim", ->
      shim = []
      shim.reporters = [ -> ]
      getProcessor = -> {}
      getReporter = -> { report: -> }
      client = new Client(getProcessor, getReporter, shim)
      expect(client.getReporters()).to.deep.equal(shim.reporters)

  describe "try", ->
    it "executes lambda", ->
      client = new Client()
      lambda = sinon.spy()
      client.try(lambda)
      expect(lambda).to.have.been.called

    it "catches error thrown by lambda", ->
      getProcessor = -> { processor: -> }
      getReporter = -> { report: -> }
      client = new Client(getProcessor, getReporter)
      error = "An error"
      tryAndThrow = -> client.try(-> throw(error))
      expect(tryAndThrow).not.to.throw(error)

    it "captures error thrown by lambda", ->
      processor = { process: sinon.spy() }
      getProcessor = -> processor
      getReporter = -> { report: -> }
      client = new Client(getProcessor, getReporter)
      error = "An error"
      client.try -> throw(error)
      expect(processor.process).to.have.been.calledWith(error)

    it "returns value from lambda", ->
      client = new Client()
      lambda = -> 'expected return value'
      expect(client.try(lambda)).to.equal('expected return value')

    it "binds lambda", ->
      client = new Client()
      expectedContext = {}
      calledContext = undefined
      lambda = -> calledContext = this
      client.try(lambda, expectedContext)
      expect(calledContext).to.equal(expectedContext)

  describe "wrap", ->
    it "does not invoke lambda immediately", ->
      client = new Client()
      lambda = sinon.spy()
      client.wrap(lambda)
      expect(lambda).not.to.have.been.called

    it "returns lambda trying supplied lambda", ->
      client = new Client()
      trySpy = sinon.spy(client, 'try')
      lambda = sinon.spy()
      wrapped = client.wrap(lambda)
      wrapped()
      expect(trySpy).to.have.been.calledWith(lambda)
      expect(lambda).to.have.been.called
