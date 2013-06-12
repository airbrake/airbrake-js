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
    return (error.stack || "").split("\n")

  describe "recognizeFrame", ->
    describe "Chrome stacktrace", ->
      it "recognizes top-level frame", ->
        result = new Processor().recognizeFrame("TypeError: number is not a function")
        expect(result.function).to.equal("TypeError: number is not a function")
        expect(result.file).to.equal("unsupported.js")
        expect(result.line).to.equal("0")

      it "recognizes remote JavaScript", ->
        result = new Processor().recognizeFrame("    at ErrorMaker (http://127.0.0.1:9001/error.js:2:6)")
        expect(result.function).to.equal("at ErrorMaker")
        expect(result.file).to.equal("http://127.0.0.1:9001/error.js")
        expect(result.line).to.equal("2")

      it "recognizes inline JavaScript", ->
        result = new Processor().recognizeFrame("    at HTMLButtonElement.onclick (http://127.0.0.1:9001/:8:184)")
        expect(result.function).to.equal("at HTMLButtonElement.onclick")
        expect(result.file).to.equal("http://127.0.0.1:9001/")
        expect(result.line).to.equal("8")

  describe "process", ->
    it "has `key`", ->
      result = new Processor("[key]").process(error)
      expect(result.key).to.equal("[key]")

    it "has `environment`", ->
      result = new Processor(null, "[environment]").process(error)
      expect(result.environment).to.equal("[environment]")

    it "has `backtrace_lines`", ->
      result = new Processor(null, null, splitStack).process(error)
      expect(result.backtrace_lines).to.exist

    describe "backtrace_lines", ->
      it "splits error stack with provided splitter", ->
        spy = sinon.spy(splitStack)
        result = new Processor(null, null, spy).process(error)
        expect(spy.calledWith(error)).to.be.true

      it "has `file`", ->
        result = new Processor(null, null, splitStack).process(error)
        line = result.backtrace_lines[0]
        expect(line.file).to.exist

      it "has `line`", ->
        result = new Processor(null, null, splitStack).process(error)
        line = result.backtrace_lines[0]
        expect(line.line).to.exist

      it "has `function`", ->
        result = new Processor(null, null, splitStack).process(error)
        line = result.backtrace_lines[0]
        expect(line.function).to.exist

    describe "request-related values", ->
      it "has `request`", ->
        result = new Processor(null, null, null).process(error)
        expect(result.request).to.exist

      describe "request_action", ->
        it "has `request_action` from error.action", ->
          result = new Processor(null, null, null).process(action: "[error_action]")
          expect(result.request_action).to.equal("[error_action]")

        it "has `request_action` string", ->
          result = new Processor(null, null, null).process({})
          expect(result.request_action).to.equal("")

      describe "request_component", ->
        it "has `request_component` from error.component", ->
          result = new Processor(null, null, null).process(component: "[error_component]")
          expect(result.request_component).to.equal("[error_component]")

        it "has `request_component` string", ->
          result = new Processor(null, null, null).process({})
          expect(result.request_component).to.equal("")

      describe "request_url", ->
        it "has `request_url` from error.url", ->
          result = new Processor(null, null, null).process(url: "[error_url]")
          expect(result.request_url).to.equal("[error_url]")

        it "has `request_url` from errorDefaults.url", ->
          result = new Processor(null, null, null, { url: "[error_defaults_url]" }).process(url: "[error_url]")
          expect(result.request_url).to.equal("[error_defaults_url]")

        it "has `request_url` from document hash", ->
          result = new Processor(null, null, null, null, "[document_location_hash]").process(error)
          expect(result.request_url).to.equal("[document_location_hash]")

        it "has `request_url` string", ->
          result = new Processor(null, null, null, null, null).process(error)
          expect(result.request_url).to.equal("")
