Client = require("../src/client")
expect = require("chai").expect

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

  it "can set and read `errorDefaults`", ->
    client = new Client()
    client.setErrorDefaults({ staggering: "fascination" })
    expect(client.getErrorDefaults().staggering).to.equal("fascination")
