Client = require("../src/client")
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

  it "can set and read `host`", ->
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
