chai = require('chai')
sinon = require('sinon')
sinon_chai = require('sinon-chai')
expect = chai.expect
chai.use(sinon_chai)

reporter = require('../../../src/reporters/xhr')


describe 'XhrReporter', ->
  spy = null

  beforeEach ->
    spy = sinon.spy(global.XMLHttpRequest.prototype, 'open')

  afterEach ->
    spy.restore()

  it 'opens async POST to url', ->
    reporter({}, {
      projectId: '[project_id]',
      projectKey: '[project_key]',
      host: 'https://api.airbrake.io',
    })
    expect(spy).to.have.been.calledWith(
      'POST',
      'https://api.airbrake.io/api/v3/projects/[project_id]/notices?key=[project_key]',
      true,
    )

  it 'opens POST to custom url', ->
    reporter({}, {
      projectId: '[project_id]',
      projectKey: '[project_key]',
      host: 'https://custom.domain.com',
    })
    expect(spy).to.have.been.calledWith(
      'POST',
      'https://custom.domain.com/api/v3/projects/[project_id]/notices?key=[project_key]',
      true,
    )
