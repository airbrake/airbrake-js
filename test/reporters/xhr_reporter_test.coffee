expect = require("chai").expect
sinon = require("sinon")

Reporter = require("../../src/reporters/xhr_reporter")

MockXhr = ->
MockXhr.prototype = {
  open: ->
  send: ->
  setRequestHeader: ->
}

describe "XHRReporter", ->
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
    result = new Reporter(null, "[environment_name]").generateOutputData()

    it "has `notifier`", ->
      expect(result.notifier).to.deep.equal(
        name: "Airbrake JS",
        version: "<%= pkg.version %>",
        url: "http://airbrake.io"
      )

    it "has `context`", ->
      expect(result.context).to.deep.equal(
        language: "JavaScript",
        environment: "[environment_name]"
      )

    it "merges custom context", ->
      result = new Reporter(null, null, { "X_KEY": "X_VAL" }).generateOutputData()
      expect(result.context.X_KEY).to.equal("X_VAL")

