import { expect } from 'chai'
import sinon from 'sinon'

import jsonifyNotice from '../../../src/internal/jsonify_notice'


describe 'jsonify_notice', ->
  context 'when called with notice', ->
    obj = {
      params: {arguments: []},
      environment: {env1: 'value1'},
      session: {session1: 'value1'},
    }
    json = null

    beforeEach ->
      json = jsonifyNotice(obj)

    it 'produces valid JSON', ->
      expect(JSON.parse(json)).to.deep.equal(obj)

  context 'when called with huge notice', ->
    obj = null
    json = null
    maxLength = 30000

    beforeEach ->
      obj = {
        params: {arr: []},
      }
      for i in [0..1000]
        obj.params.arr.push(Array(100).join('x'))
      json = jsonifyNotice(obj, 1000, maxLength)

    it 'limits json size', ->
      expect(json.length).to.be.below(maxLength)

  context 'when called with one huge string', ->
    json = null
    maxLength = 30000

    beforeEach ->
      obj = {
        params: {str: Array(100000).join('x')},
      }
      json = jsonifyNotice(obj, 1000, maxLength)

    it 'limits json size', ->
      expect(json.length).to.be.below(maxLength)

  context 'when called with huge error message', ->
    fn = null
    maxLength = 30000

    beforeEach ->
      obj = {
        errors: [{
          message: Array(100000).join('x')
        }],
      }
      fn = ->
        jsonifyNotice(obj, 1000, maxLength)

    it 'throws an exception', ->
      expect(fn).to.throw('airbrake-js: cannot jsonify notice (length=100068 maxLength=30000)')

    it 'throws an exception with `json` property', ->
      try
        fn()
      catch err
        expect(err.params.json).to.be.defined
