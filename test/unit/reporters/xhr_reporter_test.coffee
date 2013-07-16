expect = require("chai").expect
sinon = require("sinon")

Reporter = require("../../../src/reporters/xhr_reporter")

MockXhr = ->
MockXhr.prototype = {
  open: ->
  send: ->
  setRequestHeader: ->
}

describe "XhrReporter", ->
  oldXhr = null
  beforeEach ->
    oldXhr = global.XMLHttpRequest
    global.XMLHttpRequest = MockXhr
  afterEach ->
    global.XMLHttpRequest = oldXhr

  describe "report", ->
    it "opens async POST to url", ->
      spy = sinon.spy(global.XMLHttpRequest.prototype, 'open')
      new Reporter("http://0.0.0.0/endpoint").report({})
      expect(spy.calledWith('POST', "http://0.0.0.0/endpoint", true)).to.be.true

  describe "generateOutputData", ->
    result = null
    beforeEach ->
      result = new Reporter(null, "[environment_name]", "[processor_name]").generateOutputData()

    it "has `notifier`", ->
      expect(result.notifier).to.deep.equal(
        name: "Airbrake JS",
        version: "<%= pkg.version %>+[processor_name]",
        url: "http://airbrake.io"
      )

    it "has `context`", ->
      expect(result.context).to.deep.equal(
        language: "JavaScript",
        environment: "[environment_name]"
      )

    it "merges custom context", ->
      result = new Reporter(null, null, null, "CONTEXT_KEY": "CONTEXT_VAL").generateOutputData()
      expect(result.context.CONTEXT_KEY).to.equal("CONTEXT_VAL")

    it "has no `environment`", ->
      expect(result).not.to.have.property("environment")

    it "merges custom environment", ->
      result = new Reporter(null, null, null, null, "ENV_KEY": "ENV_VAL").generateOutputData()
      expect(result.environment).to.deep.equal("ENV_KEY": "ENV_VAL")

    it "has no `session`", ->
      expect(result).not.to.have.property("session")

    it "merges custom session", ->
      result = new Reporter(null, null, null, null, null, "SESS_KEY": "SESS_VAL").generateOutputData()
      expect(result.session).to.deep.equal("SESS_KEY": "SESS_VAL")

    it "has no `params`", ->
      expect(result).not.to.have.property("params")

    it "merges custom params", ->
      result = new Reporter(null, null, null, null, null, null, "PARAM_KEY": "PARAM_VAL").generateOutputData()
      expect(result.params).to.deep.equal("PARAM_KEY": "PARAM_VAL")

    it "has `errors`", ->
      result = new Reporter().generateOutputData(type: "ERR_DATA_TYPE", message: "ERR_DATA_MESSAGE", backtrace: [])
      errors = result.errors
      expect(errors.length).to.equal(1)
      expect(errors[0]).to.deep.equal(
        type: "ERR_DATA_TYPE"
        message: "ERR_DATA_MESSAGE"
        backtrace: []
      )
