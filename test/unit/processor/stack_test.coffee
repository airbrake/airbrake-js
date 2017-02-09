import { expect } from 'chai';
import sinon from 'sinon';

import processor from '../../../src/processor/stack';


describe 'stack processor', ->
  context 'when called with Firefox 30+ stack', ->
    cb = null

    beforeEach ->
      e = {
        stack: '''
               trace@file:///C:/example.html:9:17
               b@file:///C:/example.html:16:13
               a@file:///C:/example.html:19:13
               @file:///C:/example.html:21:9
               '''
      }
      cb = sinon.spy()
      processor(e, cb)

    it 'receives firefox30 processor name', ->
      expect(cb).to.have.been.called
      name = cb.lastCall.args[0]
      expect(name).to.equal('firefox30')

    it 'receives correct backtrace', ->
      expect(cb).to.have.been.called
      backtrace = cb.lastCall.args[1].backtrace
      wanted = [
        {
          'function': 'trace',
          'file': 'file:///C:/example.html',
          'line': 9,
          'column': 17
        },
        {
          'function': 'b',
          'file': 'file:///C:/example.html',
          'line': 16,
          'column': 13
        },
        {
          'function': 'a',
          'file': 'file:///C:/example.html',
          'line': 19,
          'column': 13
        },
        {
          'function': '',
          'file': 'file:///C:/example.html',
          'line': 21,
          'column': 9
        }
      ]
      expect(backtrace).to.deep.equal(wanted)

  context 'when called with Firefox 30+ stack and evaled code', ->
    cb = null

    beforeEach ->
      e = {
        stack: '''
               @file:///C:/example.html line 7 > eval line 1 > eval:1:1
               @file:///C:/example.html line 7 > eval:1:1
               @file:///C:/example.html:7:6
               '''
      }
      cb = sinon.spy()
      processor(e, cb)

    it 'receives firefox30 processor name', ->
      expect(cb).to.have.been.called
      name = cb.lastCall.args[0]
      expect(name).to.equal('firefox30')

    it 'receives correct backtrace', ->
      expect(cb).to.have.been.called
      backtrace = cb.lastCall.args[1].backtrace
      wanted = [
        {
          'function': 'line 7 > eval line 1 > eval',
          'file': 'file:///C:/example.html',
          'line': 1,
          'column': 1
        },
        {
          'function': 'line 7 > eval',
          'file': 'file:///C:/example.html',
          'line': 1,
          'column': 1
        },
        {
          'function': '',
          'file': 'file:///C:/example.html',
          'line': 7,
          'column': 6
        }
      ]
      expect(backtrace).to.deep.equal(wanted)

  context 'when called with firefox 14-29 stack', ->
    cb = null

    beforeEach ->
      e = {
        stack: '''
               trace@file:///C:/example.html:9
               b@file:///C:/example.html:16
               a@file:///C:/example.html:19
               @file:///C:/example.html:21
               '''
      }
      cb = sinon.spy()
      processor(e, cb)

    it 'receives firefox14 processor name', ->
      expect(cb).to.have.been.called
      name = cb.lastCall.args[0]
      expect(name).to.equal('firefox14')

    it 'receives correct backtrace', ->
      expect(cb).to.have.been.called
      backtrace = cb.lastCall.args[1].backtrace
      wanted = [
        {
          'function': 'trace',
          'file': 'file:///C:/example.html',
          'line': 9,
          'column': 0
        },
        {
          'function': 'b',
          'file': 'file:///C:/example.html',
          'line': 16,
          'column': 0
        },
        {
          'function': 'a',
          'file': 'file:///C:/example.html',
          'line': 19,
          'column': 0
        },
        {
          'function': '',
          'file': 'file:///C:/example.html',
          'line': 21,
          'column': 0
        }
      ]
      expect(backtrace).to.deep.equal(wanted)

  context 'when called with firefox 14-29 stack and columnNumber', ->
    cb = null

    beforeEach ->
      e = {
        stack: '''
               trace@file:///C:/example.html:9
               b@file:///C:/example.html:16
               a@file:///C:/example.html:19
               @file:///C:/example.html:21
               ''',
        columnNumber: 10
      }
      cb = sinon.spy()
      processor(e, cb)

    it 'receives firefox14 processor name', ->
      expect(cb).to.have.been.called
      name = cb.lastCall.args[0]
      expect(name).to.equal('firefox14')

    it 'receives correct backtrace with respect to columnNumber', ->
      expect(cb).to.have.been.called
      backtrace = cb.lastCall.args[1].backtrace
      wanted = [
        {
          'function': 'trace',
          'file': 'file:///C:/example.html',
          'line': 9,
          'column': 10
        },
        {
          'function': 'b',
          'file': 'file:///C:/example.html',
          'line': 16,
          'column': 0
        },
        {
          'function': 'a',
          'file': 'file:///C:/example.html',
          'line': 19,
          'column': 0
        },
        {
          'function': '',
          'file': 'file:///C:/example.html',
          'line': 21,
          'column': 0
        }
      ]
      expect(backtrace).to.deep.equal(wanted)

  context 'when called with IE stack', ->
    cb = null

    beforeEach ->
      e = {
        stack: '''
               a@http://ie.microsoft.com/testdrive/Browser/ExploreErrorStack/:360
               b@http://ie.microsoft.com/testdrive/Browser/ExploreErrorStack/:364
               c@http://ie.microsoft.com/testdrive/Browser/ExploreErrorStack/:368
               @http://ie.microsoft.com/testdrive/Browser/ExploreErrorStack/:370
               '''
      }
      cb = sinon.spy()
      processor(e, cb)

    it 'receives firefox14 processor name', ->
      expect(cb).to.have.been.called
      name = cb.lastCall.args[0]
      expect(name).to.equal('firefox14')

    it 'receives correct backtrace', ->
      expect(cb).to.have.been.called
      backtrace = cb.lastCall.args[1].backtrace
      wanted = [
        {
          'function': 'a',
          'file': 'http://ie.microsoft.com/testdrive/Browser/ExploreErrorStack/',
          'line': 360,
          'column': 0
        },
        {
          'function': 'b',
          'file': 'http://ie.microsoft.com/testdrive/Browser/ExploreErrorStack/',
          'line': 364,
          'column': 0
        },
        {
          'function': 'c',
          'file': 'http://ie.microsoft.com/testdrive/Browser/ExploreErrorStack/',
          'line': 368,
          'column': 0
        },
        {
          'function': '',
          'file': 'http://ie.microsoft.com/testdrive/Browser/ExploreErrorStack/',
          'line': 370,
          'column': 0
        }
      ]
      expect(backtrace).to.deep.equal(wanted)

  context 'when called with V8 stack', ->
    cb = null

    beforeEach ->
      e = {
        stack: '''
               ReferenceError: FAIL is not defined
                  at Constraint.execute (deltablue.js:525:2)
                  at Constraint.recalculate (deltablue.js:424:21)
                  at Planner.addPropagate (deltablue.js:701:6)
                  at Constraint.satisfy (deltablue.js:184:15)
                  at Planner.incrementalAdd (deltablue.js:591:21)
                  at Constraint.addConstraint (deltablue.js:162:10)
                  at Constraint.BinaryConstraint (deltablue.js:346:7)
                  at Constraint.EqualityConstraint (deltablue.js:515:38)
                  at chainTest (deltablue.js:807:6)
                  at deltaBlue (deltablue.js:879:2)
               '''
      }
      cb = sinon.spy()
      processor(e, cb)

    it 'receives v8 processor name', ->
      expect(cb).to.have.been.called
      name = cb.lastCall.args[0]
      expect(name).to.equal('v8')

    it 'receives correct backtrace', ->
      expect(cb).to.have.been.called
      backtrace = cb.lastCall.args[1].backtrace
      wanted = [
        {
          'function': 'Constraint.execute',
          'file': 'deltablue.js',
          'line': 525,
          'column': 2
        },
        {
          'function': 'Constraint.recalculate',
          'file': 'deltablue.js',
          'line': 424,
          'column': 21
        },
        {
          'function': 'Planner.addPropagate',
          'file': 'deltablue.js',
          'line': 701,
          'column': 6
        },
        {
          'function': 'Constraint.satisfy',
          'file': 'deltablue.js',
          'line': 184,
          'column': 15
        },
        {
          'function': 'Planner.incrementalAdd',
          'file': 'deltablue.js',
          'line': 591,
          'column': 21
        },
        {
          'function': 'Constraint.addConstraint',
          'file': 'deltablue.js',
          'line': 162,
          'column': 10
        },
        {
          'function': 'Constraint.BinaryConstraint',
          'file': 'deltablue.js',
          'line': 346,
          'column': 7
        },
        {
          'function': 'Constraint.EqualityConstraint',
          'file': 'deltablue.js',
          'line': 515,
          'column': 38
        },
        {
          'function': 'chainTest',
          'file': 'deltablue.js',
          'line': 807,
          'column': 6
        },
        {
          'function': 'deltaBlue',
          'file': 'deltablue.js',
          'line': 879,
          'column': 2
        }
      ]
      expect(backtrace).to.deep.equal(wanted)

  context 'when called with V8 stack and alias', ->
    cb = null

    beforeEach ->
      e = {
        stack: '''
               at Type.functionName [as methodName] (location)
               '''
      }
      cb = sinon.spy()
      processor(e, cb)

    it 'receives v8 processor name', ->
      expect(cb).to.have.been.called
      name = cb.lastCall.args[0]
      expect(name).to.equal('v8')

    it 'receives correct backtrace', ->
      expect(cb).to.have.been.called
      backtrace = cb.lastCall.args[1].backtrace
      wanted = [
        {
          'function': 'Type.functionName [as methodName]',
          'file': 'location',
          'line': 0,
          'column': 0
        }
      ]
      expect(backtrace).to.deep.equal(wanted)

  context 'when called with V8 stack and nested evals', ->
    cb = null

    beforeEach ->
      e = {
        stack: '''
               at functionName (eval at Foo.a (eval at Bar.z (myscript.js:10:3)))
               '''
      }
      cb = sinon.spy()
      processor(e, cb)

    it 'receives v8 processor name', ->
      expect(cb).to.have.been.called
      name = cb.lastCall.args[0]
      expect(name).to.equal('v8')

    it 'receives correct backtrace', ->
      expect(cb).to.have.been.called
      backtrace = cb.lastCall.args[1].backtrace
      wanted = [
        {
          'function': 'functionName',
          'file': 'eval at Foo.a (eval at Bar.z (myscript.js:10:3))',
          'line': 0,
          'column': 0
        }
      ]
      expect(backtrace).to.deep.equal(wanted)

  context 'when called with PhantomJS stack', ->
    cb = null

    beforeEach ->
      e = {
        stack: '''
               at http://domain/file1?key=value:11
               at http://domain/file2?key=value:22
               '''
      }
      cb = sinon.spy()
      processor(e, cb)

    it 'receives default processor name', ->
      expect(cb).to.have.been.called
      name = cb.lastCall.args[0]
      expect(name).to.equal('phantomjs')

    it 'receives correct backtrace', ->
      expect(cb).to.have.been.called
      backtrace = cb.lastCall.args[1].backtrace
      wanted = [
        {
          'function': '',
          'file': 'http://domain/file1?key=value',
          'line': 11,
          'column': 0
        },
        {
          'function': '',
          'file': 'http://domain/file2?key=value',
          'line': 22,
          'column': 0
        }
      ]
      expect(backtrace).to.deep.equal(wanted)

  context 'when called with unknown stack', ->
    cb = null

    beforeEach ->
      e = {
        stack: '''
               foo: bar
               hello world
               '''
      }
      cb = sinon.spy()
      processor(e, cb)

    it 'receives default processor name', ->
      expect(cb).to.have.been.called
      name = cb.lastCall.args[0]
      expect(name).to.equal('default')

    it 'receives correct backtrace', ->
      expect(cb).to.have.been.called
      backtrace = cb.lastCall.args[1].backtrace
      wanted = [
        {
          'function': 'foo: bar',
          'file': '',
          'line': 0,
          'column': 0
        },
        {
          'function': 'hello world',
          'file': '',
          'line': 0,
          'column': 0
        }
      ]
      expect(backtrace).to.deep.equal(wanted)

  context 'when called with a standard ErrorEvent', ->
    cb = null
    e = null

    beforeEach ->
      e = {
        message: 'Uncaught Error: Example error'
        filename: 'http://example.com/example.js'
        lineno: 10
        column: 4
      }
      cb = sinon.spy()
      processor(e, cb)

    it 'receives nostack processor name', ->
      expect(cb).to.have.been.called
      name = cb.lastCall.args[0]
      expect(name).to.equal('nostack')

    it 'receives correct backtrace', ->
      expect(cb).to.have.been.called
      backtrace = cb.lastCall.args[1].backtrace
      wanted = [
        {
          'function': '',
          'file': e.filename,
          'line': e.lineno,
          'column': e.column
        }
      ]
      expect(backtrace).to.deep.equal(wanted)

  context 'when called with a non-standard ErrorEvent (Chrome)', ->
    cb = null
    e = null

    beforeEach ->
      e = {
        message: 'Uncaught Error: Example error'
        filename: 'http://example.com/example.js'
        lineno: 10
        colno: 4
      }
      cb = sinon.spy()
      processor(e, cb)

    it 'receives nostack processor name', ->
      expect(cb).to.have.been.called
      name = cb.lastCall.args[0]
      expect(name).to.equal('nostack')

    it 'receives correct backtrace', ->
      expect(cb).to.have.been.called
      backtrace = cb.lastCall.args[1].backtrace
      wanted = [
        {
          'function': '',
          'file': e.filename,
          'line': e.lineno,
          'column': e.colno
        }
      ]
      expect(backtrace).to.deep.equal(wanted)

  context 'when called with a string', ->
    cb = null
    e = null

    beforeEach ->
      cb = sinon.spy()
      e = 'hello'
      processor(e, cb)

    it 'receives nostack processor name', ->
      expect(cb).to.have.been.called
      name = cb.lastCall.args[0]
      expect(name).to.equal('nostack')

    it 'receives empty error type', ->
      expect(cb).to.have.been.called
      type = cb.lastCall.args[1].type
      expect(type).to.equal('')

    it 'receives the string as error message', ->
      expect(cb).to.have.been.called
      message = cb.lastCall.args[1].message
      expect(message).to.equal(e)

    it 'receives empty backtrace', ->
      expect(cb).to.have.been.called
      backtrace = cb.lastCall.args[1].backtrace
      expect(backtrace).to.deep.equal([])

  context 'when called with name and message', ->
    cb = null

    beforeEach ->
      e = {
        name: 'Error'
        message: 'message'
      }
      cb = sinon.spy()
      processor(e, cb)

    it 'receives nostack processor name', ->
      expect(cb).to.have.been.called
      name = cb.lastCall.args[0]
      expect(name).to.equal('nostack')

    it 'receives error type and message', ->
      expect(cb).to.have.been.called
      err = cb.lastCall.args[1]
      expect(err.type).to.equal('Error')
      expect(err.message).to.equal('message')

  context 'when called without name', ->
    cb = null

    beforeEach ->
      cb = sinon.spy()
      e = {message: 'message'}
      processor(e, cb)

    it 'receives correct error', ->
      expect(cb).to.have.been.called
      err = cb.lastCall.args[1]
      expect(err.type).to.equal('')
      expect(err.message).to.equal('message')

  context 'when called without message', ->
    cb = null

    beforeEach ->
      cb = sinon.spy()
      e = {name: 'Error'}
      processor(e, cb)

    it 'receives correct error', ->
      expect(cb).to.have.been.called
      err = cb.lastCall.args[1]
      expect(err.type).to.equal('Error')
      expect(err.message).to.equal('[object Object]')

  context 'when called with empty string', ->
    cb = null

    beforeEach ->
      cb = sinon.spy()
      processor('', cb)

    it 'error is ignored', ->
      expect(cb).not.to.have.been.called

  context 'when called with non-string message', ->
    cb = null

    beforeEach ->
      cb = sinon.spy()
      e = {message: [1, 2, 3]}
      processor(e, cb)

    it 'receives stringified message', ->
      expect(cb).to.have.been.called
      err = cb.lastCall.args[1]
      expect(err.message).to.equal('1,2,3')
