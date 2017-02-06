import chai from 'chai'
import sinon from 'sinon'
import sinon_chai from 'sinon-chai'
expect = chai.expect
chai.use(sinon_chai)

import reporter from '../../../src/reporters/jsonp'


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
