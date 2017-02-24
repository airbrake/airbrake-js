import Promise from '../../../src/promise'
import reporter from '../../../src/reporter/jsonp'


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
    }, new Promise())
    expect(head.appendChild).to.have.been.called
