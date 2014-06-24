expect = require('chai').expect
sinon = require('sinon')

jsonifyNotice = require('../../../src/util/jsonify_notice.coffee')


describe 'jsonify_notice', ->
  context 'when called with notice', ->
    obj = {
      params: { arguments: [] },
      environment: { env1: 'value1' },
      session: { session1: 'value1' },
    }
    json = null

    beforeEach ->
      json = jsonifyNotice(obj)

    it 'produces valid JSON', ->
      expect(JSON.parse(json)).to.deep.equal(obj)
