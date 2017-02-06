import { expect } from 'chai'
import sinon from 'sinon'

import processor from '../../../src/processors/stacktracejs'


describe 'stacktracejs processor', ->
  cb = null

  beforeEach  ->
    cb = sinon.spy()
    try
      throw new Error('BOOM')
    catch err
      processor(err, cb)

  it 'calls callback', ->
    expect(cb).to.have.been.called

  it 'provides processor name', ->
    name = cb.lastCall.args[0]
    expect(name).to.equal('stacktracejs')

  it 'provides type and message', ->
    type = cb.lastCall.args[1].type
    expect(type).to.equal('Error')

    msg = cb.lastCall.args[1].message
    expect(msg).to.equal('BOOM')

  it 'provides backtrace', ->
    backtrace = cb.lastCall.args[1].backtrace
    expect(backtrace.length).to.equal(6)

    frame = backtrace[0]
    expect(frame.file).to.contain('test/unit/processors/stacktracejs_test.coffee')
    expect(frame.function).to.equal('')
    expect(frame.line).to.be.a('number')
    expect(frame.column).to.be.a('number')
