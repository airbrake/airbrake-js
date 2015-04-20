expect = require('chai').expect
sinon = require('sinon')

Promise = require('../../../src/internal/promise')


describe 'Promise', ->
  promise = null
  resolve = null
  onResolved = null
  reject = null
  onRejected = null

  beforeEach ->
    executor = (_resolve, _reject) ->
      resolve = _resolve
      reject = _reject
    onResolved = sinon.spy()
    onRejected = sinon.spy()
    promise = new Promise(executor).then(onResolved, onRejected)
    # Don't return promise.
    return

  it 'calls onResolved when resolved', ->
    expect(onResolved).to.not.have.been.called
    resolve('hello', 'world')
    expect(onResolved).to.have.been.called
    expect(onResolved.lastCall.args).to.deep.equal(['hello', 'world'])

  it 'calls onRejected when rejected', ->
    expect(onRejected).to.not.have.been.called
    reject('reason')
    expect(onRejected).to.have.been.called
    expect(onRejected.lastCall.args).to.deep.equal(['reason'])

  it 'calls onResolved when binded after resolve', ->
    resolve('hello', 'world')
    onResolved = sinon.spy()
    promise.then(onResolved)
    expect(onResolved).to.have.been.called
