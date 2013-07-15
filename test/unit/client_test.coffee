chai       = require("chai")
sinon      = require("sinon")
sinon_chai = require("sinon-chai")
expect     = chai.expect
chai.use(sinon_chai)

Client = require("../../src/client")

describe "Client", ->
  describe "environment", ->
    it "is \"environment\" by default", ->
      client = new Client()
      expect(client.getEnvironment()).to.equal("environment")

    it "can be set and read", ->
      client = new Client()
      client.setEnvironment("[custom_environment]")
      expect(client.getEnvironment()).to.equal("[custom_environment]")

  it "can set and read `project`", ->
    client = new Client()
    client.setProject("[custom_project_id]", "[custom_key]")
    expect(client.getProject()).to.deep.equal([ "[custom_project_id]", "[custom_key]" ])

  describe "outputFormat", ->
    it "is JSON by default", ->
      client = new Client()
      expect(client.getOutputFormat()).to.equal("JSON")

    it "can set and read", ->
      client = new Client()
      client.setOutputFormat("XML")
      expect(client.getOutputFormat()).to.equal("XML")

  describe "captureException", ->
    processor = { process: sinon.spy() }
    reporter = { report: sinon.spy() }
    getProcessor = -> processor
    getReporter = -> reporter

    exception = do ->
      error = undefined
      try
        (0)()
      catch _err
        error = _err

      return error

    it "processes with processor", ->
      client = new Client(getProcessor, getReporter)
      client.captureException(exception)

      expect(processor.process).to.have.been.called

    it "reports with reporter", ->
      client = new Client(getProcessor, getReporter)
      client.captureException(exception)

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

      run = -> client.captureException(exception)
      expect(run).not.to.throw()

    it "ignores errors thrown by reporter", ->
      reporter = { report: -> throw(new Error("Reporter Error")) }
      getReporter = -> reporter
      client = new Client(getProcessor, getReporter)

      run = -> client.captureException(exception)
      expect(run).not.to.throw()