Client = require("../src/Client")
expect = require("chai").expect
sinon = require("sinon")

describe "Client", ->
  it "can set and read `environment`", ->
    client = new Client()
    client.setEnvironment("[custom_environment]")
    expect(client.getEnvironment()).to.equal("[custom_environment]")

  it "can set and read `key`", ->
    client = new Client()
    client.setKey("[custom_key]")
    expect(client.getKey()).to.equal("[custom_key]")

  it "can set and read `projectId`", ->
    client = new Client()
    client.setProjectId("[custom_project_id]")
    expect(client.getProjectId()).to.equal("[custom_project_id]")

  describe "host", ->
    it "is \"api.airbrake.io\" by default", ->
      client = new Client()
      expect(client.getHost()).to.equal("api.airbrake.io")

    it "can be set and read", ->
      client = new Client()
      client.setHost("[custom_host]")
      expect(client.getHost()).to.equal("[custom_host]")

  describe "guessFunctionName", ->
    it "is false by default", ->
      client = new Client();
      expect(client.getGuessFunctionName()).to.be.false

    it "can set and read", ->
      client = new Client()
      client.setGuessFunctionName(true)
      expect(client.getGuessFunctionName()).to.be.true

  describe "trackJQ", ->
    it "is false by default", ->
      client = new Client();
      expect(client.getTrackJQ()).to.be.false

    it "can set and read", ->
      client = new Client()
      client.setTrackJQ(true)
      expect(client.getTrackJQ()).to.be.true

    it "calls setupjQueryTracker", ->
      spy = sinon.spy()
      client = new Client(undefined, undefined, spy);
      client.setTrackJQ(true)
      expect(spy.called).to.be.true

    it "calls setupjQueryTracker only on trackJQ state change", ->
      spy = sinon.spy()
      client = new Client(undefined, undefined, spy);
      client.setTrackJQ(true)
      client.setTrackJQ(true)
      expect(spy.callCount).to.equal(1)

  describe "outputFormat", ->
    it "is JSON by default", ->
      client = new Client();
      expect(client.getOutputFormat()).to.equal("JSON")

    it "can set and read", ->
      client = new Client()
      client.setOutputFormat("XML")
      expect(client.getOutputFormat()).to.equal("XML")

  it "can set and read `errorDefaults`", ->
    client = new Client()
    client.setErrorDefaults({ staggering: "fascination" })
    expect(client.getErrorDefaults().staggering).to.equal("fascination")

  describe "captureException", ->
    exception = do ->
      error = undefined
      try
        (0)()
      catch _err
        error = _err

      return error

    it "processes with processor", ->
      processor = { process: sinon.spy() }
      reporter = { report: -> }
      getProcessor = -> processor
      getReporter = -> reporter

      client = new Client(getProcessor, getReporter)
      client.captureException(exception)

      expect(processor.process.called).to.be.true
