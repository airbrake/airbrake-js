chai       = require("chai")
sinon      = require("sinon")
sinon_chai = require("sinon-chai")
expect     = chai.expect
chai.use(sinon_chai)

Client = require("../../src/client")

describe "Client", ->
  clock = undefined
  beforeEach -> clock = sinon.useFakeTimers()
  afterEach -> clock.restore()

  writeThroughProcessor = null
  beforeEach -> writeThroughProcessor = { process: (data, fn) -> fn('write-through', data); }

  describe "environmentName", ->
    it "is \"\" by default", ->
      client = new Client()
      expect(client.getEnvironmentName()).to.equal("")

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

  describe "addEnvironment", ->
    it "can be set and read", ->
      client = new Client()
      client.addEnvironment(key1: "[custom_env_key1_value]")
      expect(client.getEnvironment().key1).to.equal("[custom_env_key1_value]")

    it "overrides previously set key", ->
      client = new Client()
      client.addEnvironment(key1: "[custom_env_key1_value]")
      client.addEnvironment(key1: "[custom_env_key1_value2]")
      expect(client.getEnvironment().key1).to.equal("[custom_env_key1_value2]")

    it "preserves unspecified keys", ->
      client = new Client()
      client.addEnvironment(key1: "[custom_env_key1_value]")
      client.addEnvironment(key2: "[custom_env_key1_value2]")
      expect(client.getEnvironment().key1).to.equal("[custom_env_key1_value]")

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

  describe 'filters', ->
    processor    = null
    reporter     = null
    getProcessor = null
    getReporter  = null
    client       = null

    beforeEach ->
      processor      = sinon.spy((error) -> {})
      reporter       = sinon.spy()
      getProcessor   = -> { process: processor }
      getReporter    = -> reporter
      client         = new Client(getProcessor, getReporter)

    describe 'addFilter', ->
      it 'can prevent report', ->
        filter = sinon.spy((notice) -> false)
        client.addFilter(filter)

        client.push(error: {})
        continueFromProcessor = processor.lastCall.args[1]
        continueFromProcessor('test', {})

        expect(reporter).not.to.have.been.called
        expect(filter).to.have.been.called

      it 'can allow report', ->
        filter = sinon.spy((notice) -> true)
        client.addFilter(filter)

        client.push(error: {})
        continueFromProcessor = processor.lastCall.args[1]
        continueFromProcessor('test', {})

        expect(reporter).to.have.been.called
        notice = reporter.lastCall.args[0]
        expect(filter).to.have.been.calledWith(notice)

  describe "push", ->
    exception = do ->
      error = undefined
      try
        (0)()
      catch _err
        error = _err
      return error

    it "is aliased as push", ->
      client = new Client()
      expect(client.push).to.equal(client.push)

    describe "with pushed calls to processor", ->
      it "processes with processor", ->
        processor = { process: sinon.spy() }
        reporter = { report: sinon.spy() }
        getProcessor = -> processor
        getReporter = -> reporter

        client = new Client(getProcessor, getReporter)
        client.push(exception)

        expect(processor.process).to.have.been.called

    describe "custom data sent to reporter", ->
      it "reports context", ->
        reporter = sinon.spy()
        getReporter = -> reporter
        getProcessor = -> writeThroughProcessor

        client = new Client(getProcessor, getReporter)
        client.addContext(context_key: "[custom_context]")
        client.push(exception)

        reported = reporter.lastCall.args[0]
        expect(reported.context.context_key).to.equal("[custom_context]")

      it "reports environment", ->
        reporter = sinon.spy()
        getReporter = -> reporter
        getProcessor = -> writeThroughProcessor

        client = new Client(getProcessor, getReporter)
        client.addEnvironment(env_key: "[custom_env]")
        client.push(exception)

        reported = reporter.lastCall.args[0]
        expect(reported.environment.env_key).to.equal("[custom_env]")

      it "reports params", ->
        reporter = sinon.spy()
        getReporter = -> reporter
        getProcessor = -> writeThroughProcessor

        client = new Client(getProcessor, getReporter)
        client.addParams(params_key: "[custom_params]")
        client.push(exception)

        reported = reporter.lastCall.args[0]
        expect(reported.params.params_key).to.equal("[custom_params]")

      it "reports session", ->
        reporter = sinon.spy()
        getReporter = -> reporter
        getProcessor = -> writeThroughProcessor

        client = new Client(getProcessor, getReporter)
        client.addSession(session_key: "[custom_session]")
        client.push(exception)

        reported = reporter.lastCall.args[0]
        expect(reported.session.session_key).to.equal("[custom_session]")

      describe "wrapped error", ->
        it "unwraps and processes error", ->
          reporter = sinon.spy()
          processor = { process: sinon.spy() }
          getReporter = -> reporter
          getProcessor = -> processor

          client = new Client(getProcessor, getReporter)
          client.push(error: exception)
          expect(processor.process).to.have.been.calledWith(exception)

        it "reports custom context", ->
          reporter = sinon.spy()
          getReporter = -> reporter
          getProcessor = -> writeThroughProcessor

          client = new Client(getProcessor, getReporter)
          client.addContext(context1: "value1", context2: "value2")
          client.push
            error: exception
            context:
              context1: "push_value1"
              context3: "push_value3"

          reported = reporter.lastCall.args[0]
          expect(reported.context).to.deep.equal
            language: "JavaScript"
            context1: "push_value1"
            context2: "value2"
            context3: "push_value3"

        it "reports custom environment", ->
          reporter = sinon.spy()
          getReporter = -> reporter
          getProcessor = -> writeThroughProcessor

          client = new Client(getProcessor, getReporter)
          client.addEnvironment(env1: "value1", env2: "value2")
          client.push
            error: exception
            environment:
              env1: "push_value1"
              env3: "push_value3"

          reported = reporter.lastCall.args[0]
          expect(reported.environment).to.deep.equal
            env1: "push_value1"
            env2: "value2"
            env3: "push_value3"

        it "reports custom params", ->
          reporter = sinon.spy()
          getReporter = -> reporter
          getProcessor = -> writeThroughProcessor

          client = new Client(getProcessor, getReporter)
          client.addParams(param1: "value1", param2: "value2")
          client.push
            error: exception
            params:
              param1: "push_value1"
              param3: "push_value3"

          reported = reporter.lastCall.args[0]
          expect(reported.params).to.deep.equal
            param1: "push_value1"
            param2: "value2"
            param3: "push_value3"

        it "reports custom session", ->
          reporter = sinon.spy()
          processor = { process: (data, fn) -> fn(data) }
          getReporter = -> reporter
          getProcessor = -> writeThroughProcessor

          client = new Client(getProcessor, getReporter)
          client.addSession(session1: "value1", session2: "value2")
          client.push
            error: exception
            session:
              session1: "push_value1"
              session3: "push_value3"

          reported = reporter.lastCall.args[0]
          expect(reported.session).to.deep.equal
            session1: "push_value1"
            session2: "value2"
            session3: "push_value3"

  describe "data supplied by shim", ->
    it "processes extant errors", ->
      processor = { process: sinon.spy() }
      getProcessor = -> processor
      getReporter = -> { report: -> }
      client = new Client(getProcessor, getReporter, [ "extant error" ])
      clock.tick()
      expect(processor.process).to.have.been.calledWith("extant error")

    it "reports processed error and options to custom reporter", ->
      custom_reporter = sinon.spy()
      processed_error = sinon.spy()
      processed_options = sinon.match.typeOf("object")
      getReporter = -> ->
      getProcessor = -> { process: (error, fn) -> fn(processed_error) }
      client = new Client(getProcessor, getReporter)
      client.addReporter(custom_reporter)
      client.push(error: {})
      expect(custom_reporter).to.have.been.called

  describe "wrap", ->
    it "does not invoke lambda immediately", ->
      client = new Client()
      lambda = sinon.spy()
      client.wrap(lambda)
      expect(lambda).not.to.have.been.called
