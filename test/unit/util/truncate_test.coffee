expect = require('chai').expect
sinon = require('sinon')

truncate = require('../../../src/util/truncate.coffee')


describe 'truncate', ->
  context 'when called with plain object', ->
    obj = {
      null: null,
      undefined: undefined,
      bool: true,
      boolObj: new Boolean(true),
      int: 1,
      float: 3.14,
      numberObj: new Number(1),
      infinity: Infinity,
      nan: NaN,
      ln2: Math.LN2,
      str: 'hello world',
      strObj: new String('hello world'),
      arr: ['foo', 'bar'],
      obj: {'foo': 'bar'},
      date: new Date(),
      func: Math.sin,
      func2: new Function('x', 'y', 'return x * y'),
      re: /s/,
    }

    truncated = null

    beforeEach ->
      truncated = truncate(obj)

    it 'produces same object', ->
      expect(truncated).to.deep.equal(obj)

  context 'when called with object with circular references', ->
    obj = {foo: 'bar'}
    obj.circularRef = obj
    obj.circularList = [obj, obj]

    truncated = null

    beforeEach ->
      truncated = truncate(obj)

    it 'produces object with resolved circular references', ->
      expect(truncated).to.deep.equal({
        'foo': 'bar',
        'circularRef': '[Circular ~]',
        'circularList': [ '[Circular ~]', '[Circular ~]' ]
      })

  context 'when called with object with complex circular references', ->
    a = { x: 1 }
    a.a = a
    b = { x: 2 }
    b.a = a
    c = { a: a, b: b };

    obj = { list: [ a, b, c ] }
    obj.obj = obj

    truncated = null

    beforeEach ->
      truncated = truncate(obj)

    it 'produces object with resolved circular references', ->
      expect(truncated).to.deep.equal({
        'list': [
          {
            'x': 1,
            'a': '[Circular ~.list.0]'
          },
          {
            'x': 2,
            'a': '[Circular ~.list.0]'
          },
          {
            'a': '[Circular ~.list.0]',
            'b': '[Circular ~.list.1]'
          }
        ],
        'obj': '[Circular ~]'
      })

  context 'when called with deeply nested objects', ->
    obj = {}
    tmp = obj
    for i in [0..100]
      tmp.value = i
      tmp.obj = {}
      tmp = tmp.obj

    truncated = null

    beforeEach ->
      truncated = truncate(obj)

    it 'produces truncated object', ->
      expect(truncated).to.deep.equal({
        'value': 0,
        'obj': {
          'value': 1,
          'obj': {
            'value': 2,
            'obj': {
              'value': 3,
              'obj': {
                'value': 4,
                'obj': '[Truncated]'
              }
            }
          }
        }
      })
