expect = require('chai').expect
sinon = require('sinon')

processor = require('../../../src/processors/stacktracejs')


describe 'stacktracejs processor', ->
  cb = null

  beforeEach  ->
    cb = sinon.spy()
    processor(new Error('BOOM'), cb)

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
    expect(frame.file).to.contain('airbrake-js/test/unit/processors/stacktracejs_test.coffee')
    expect(frame.function).to.equal('Context.<anonymous>')
    expect(frame.line).to.be.a('number')
    expect(frame.column).to.a('number')
