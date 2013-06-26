expect = require("chai").expect
Processor = require("../../../src/processors/fallback_processor")

stack = "at ErrorMaker (http://localhost:9001/test/examples/js/error.js:2:6)"

describe "FallbackProcessor", ->
  describe "#process", ->
    processor = new Processor()

    it "determines error type", ->
      result = processor.process(stack: "SyntaxError: unexpected }")
      expect(result.type).to.equal("SyntaxError")

    it "uses `Error` for unknown error type", ->
      result = processor.process()
      expect(result.type).to.equal("Error")

    describe ".backtrace", ->
      it "has backtrace", ->
        result = processor.process()
        expect(result.backtrace).to.be.an('array')

      it "recognizes line numbers", ->
        result = processor.process(stack: stack)
        backtrace_line = result.backtrace[0]
        expect(backtrace_line.line).to.equal('2')

      it "recognizes files", ->
        result = processor.process(stack: stack)
        backtrace_line = result.backtrace[0]
        expect(backtrace_line.file).to.equal('http://localhost:9001/test/examples/js/error.js')

      it "recognizes functions", ->
        result = processor.process(stack: stack)
        backtrace_line = result.backtrace[0]
        expect(backtrace_line.function).to.equal('ErrorMaker')
