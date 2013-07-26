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
    reporter = { report: sinon.spy() }
    getReporter = -> reporter

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
      processor = { process: sinon.spy() }
      getProcessor = -> processor

      it "processes with processor", ->
        client = new Client(getProcessor, getReporter)
        client.capture(exception)

        expect(processor.process).to.have.been.called

      it "reports with reporter", ->
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
        getProcessor = -> processor
        client = new Client(getProcessor, getReporter)

        run = -> client.capture(exception)
        expect(run).not.to.throw()

      it "ignores errors thrown by reporter", ->
        reporter = { report: -> throw(new Error("Reporter Error")) }
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

  it "processes extant errors", ->
    processor = { process: sinon.spy() }
    getProcessor = -> processor
    getReporter = -> { report: -> }
    client = new Client(getProcessor, getReporter, [ "extant error" ])
    expect(processor.process).to.have.been.calledWith("extant error")