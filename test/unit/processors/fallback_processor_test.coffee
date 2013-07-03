expect = require("chai").expect
Processor = require("../../../src/processors/fallback_processor")

stack = "at ErrorMaker (http://localhost:9001/test/examples/js/error.js:2:6)"

describe "FallbackProcessor", ->
  describe "#process", ->
    processor = new Processor()

    it "determines error type", (finish) ->
      processor.process stack: "SyntaxError: unexpected }", (result) ->
        expect(result.type).to.equal("SyntaxError")
        do finish

    it "uses `Error` for unknown error type", (finish) ->
      processor.process {}, (result) ->
        expect(result.type).to.equal("Error")
        do finish

    describe ".backtrace", ->
      it "has backtrace", (finish) ->
        processor.process {}, (result) ->
          expect(result.backtrace).to.be.an('array')
          do finish

      it "recognizes line numbers", (finish) ->
        processor.process stack: stack, (result) ->
          backtrace_line = result.backtrace[0]
          expect(backtrace_line.line).to.equal(2)
          do finish

      it "recognizes files", (finish) ->
        result = processor.process stack: stack, (result) ->
          backtrace_line = result.backtrace[0]
          expect(backtrace_line.file).to.equal('http://localhost:9001/test/examples/js/error.js')
          do finish

      it "recognizes functions", (finish) ->
        result = processor.process stack: stack, (result) ->
          backtrace_line = result.backtrace[0]
          expect(backtrace_line.function).to.equal('ErrorMaker')
          do finish
