expect = require("chai").expect
Processor = require("../../../src/processors/fallback_processor")

describe "FallbackProcessor", ->
  describe "#process", ->
    processor = new Processor()

    it "determines error type", ->
      result = processor.process(stack: "SyntaxError: unexpected }")
      expect(result.type).to.equal("SyntaxError")

    it "uses `Error` for unknown error type", ->
      result = processor.process()
      expect(result.type).to.equal("Error")
