import { expect } from '../chai_with_sinon'
import sinon from 'sinon'

import reporter from '../../../src/reporter/compat'


describe 'CompatReporter', ->
  spy = null

  beforeEach ->
    spy = sinon.spy(window.XMLHttpRequest.prototype, 'open')

  afterEach ->
    spy.restore()

  it 'opens async POST to url', ->
    reporter({}, {
      projectId: '[project_id]',
      projectKey: '[project_key]',
      host: 'https://api.airbrake.io'
    })
    expect(spy).to.have.been.calledWith(
      'POST',
      'https://api.airbrake.io/api/v3/projects/[project_id]/create-notice?key=[project_key]',
      true
    )

  it 'opens POST to custom url', ->
    reporter({}, {
      projectId: '[project_id]',
      projectKey: '[project_key]',
      host: 'https://custom.domain.com'
    })
    expect(spy).to.have.been.calledWith(
      'POST',
      'https://custom.domain.com/api/v3/projects/[project_id]/create-notice?key=[project_key]',
      true
    )
