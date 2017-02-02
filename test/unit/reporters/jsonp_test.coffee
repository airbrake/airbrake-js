chai = require('chai')
sinon = require('sinon')
sinon_chai = require('sinon-chai')
expect = chai.expect
chai.use(sinon_chai)

reporter = require('../../../src/reporters/jsonp')


describe 'JSONPReporter', ->
  head = null

  beforeEach ->
    head = {
      appendChild: sinon.spy()
    }
    global.document.getElementsByTagName = sinon.spy ->
      return [head]

  it 'report creates script tag with custom host', ->
    reporter({}, {
      projectId: '[project_id]',
      projectKey: '[project_key]',
      host: 'https://custom.domain.com'
    })
    expect(head.appendChild).to.have.been.called
