expect = require("chai").expect
sinon = require("sinon")

Reporter = require("../../src/reporters/xhr_reporter")

oldXhr = null
MockXhr = ->
MockXhr.prototype = {
  open: ->
  send: ->
  setRequestHeader: ->
}

describe "XHRReporter", ->
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

    it "sends formatted data", ->
      spy = sinon.spy(global.XMLHttpRequest.prototype, 'send')
      new Reporter("http://0.0.0.0/endpoint").report({})
      formatted_data = spy.args[0][0]
      parsed = JSON.parse(formatted_data)
      expect(parsed.context).to.exist
