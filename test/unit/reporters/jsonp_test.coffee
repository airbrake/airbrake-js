expect = require('chai').expect
sinon = require('sinon')

reporter = require('../../../src/reporters/jsonp')


MockHead = ->
MockHead.prototype = {
  appendChild: ->
  removeChild: ->
}

MockDocument = ->
MockDocument.prototype = {
  getElementsByTagName: ->
    return[new MockHead]
}

describe 'JSONPReporter', ->
  oldDocument = null

  beforeEach ->
    oldDocument = global.document
    global.document = new MockDocument

  afterEach ->
    global.document = oldDocument

  describe 'report', ->
    it 'creates script tag with custom host', ->
      mock = sinon.mock({})
      MockDocument.prototype.createElement = ->
        return mock
      reporter({}, {projectId: '[project_id]', projectKey: '[project_key]', host: 'https://custom.domain.com'})
      expect(mock.src).to.contain('https://custom.domain.com')
