expect = require("chai").expect
sinon = require("sinon")

Processor = require("../../src/processors/browser_processor")

error = {
  message: "number is not a function",
  stack: """TypeError: number is not a function
     at null.<anonymous> (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/spec/basicSpecs.js:56:16)
     at jasmine.Block.execute (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:1024:15)
     at jasmine.Queue.next_ (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2025:31)
     at jasmine.Queue.start (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:1978:8)
     at jasmine.Spec.execute (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2305:14)
     at jasmine.Queue.next_ (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2025:31)
     at jasmine.Queue.start (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:1978:8)
     at jasmine.Suite.execute (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2450:14)
     at jasmine.Queue.next_ (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2025:31)
     at onComplete (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2021:18)"""
}

describe "BrowserProcessor", ->
  splitStack = (error) ->
    return error.stack.split("\n")

  describe "recognizeFrame", ->
    it "recognizes top-level frame", ->
      result = new Processor().recognizeFrame("TypeError: number is not a function")
      expect(result.function).to.equal("TypeError: number is not a function")
      expect(result.file).to.equal("unsupported.js")
      expect(result.line).to.equal("0")

  describe "process", ->
    it "has `key`", ->
      result = new Processor("[key]").process(error)
      expect(result.key).to.equal("[key]")

    it "has `environment`", ->
      result = new Processor(undefined, "[environment]").process(error)
      expect(result.environment).to.equal("[environment]")


    it "has `backtrace_lines`", ->
      result = new Processor(undefined, undefined, splitStack).process(error)
      expect(result.backtrace_lines).to.exist

    describe "backtrace_lines", ->
      it "splits error stack with provided splitter", ->
        spy = sinon.spy(splitStack)
        result = new Processor(undefined, undefined, spy).process(error)
        expect(spy.calledWith(error)).to.be.true

      it "has `file`", ->
        result = new Processor(undefined, undefined, splitStack).process(error)
        line = result.backtrace_lines[0]
        expect(line.file).to.exist

      it "has `line`", ->
        result = new Processor(undefined, undefined, splitStack).process(error)
        line = result.backtrace_lines[0]
        expect(line.line).to.exist

      it "has `function`", ->
        result = new Processor(undefined, undefined, splitStack).process(error)
        line = result.backtrace_lines[0]
        expect(line.function).to.exist
