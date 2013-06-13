expect = require("chai").expect
sinon = require("sinon")

fn = require("../../src/stacktrace_builders/fallback_builder")

describe "FallbackBuilder", ->
  describe "Chrome stacktrace", ->
    it "recognizes top-level frame", ->
      result = fn(stack: "TypeError: number is not a function")
      expect(result).to.deep.equal([
        {
          func: "TypeError: number is not a function",
          url: "unsupported.js",
          line: "0",
          context: null,
          column: "0"
        }
      ])

    it "recognizes remote JavaScript", ->
      result = fn(stack: "    at ErrorMaker (http://127.0.0.1:9001/error.js:2:6)")
      expect(result).to.deep.equal([
        {
          func: "at ErrorMaker",
          url: "http://127.0.0.1:9001/error.js",
          line: "2",
          context: null,
          column: "6"
        }
      ])

    it "recognizes inline JavaScript", ->
      result = fn(stack: "    at HTMLButtonElement.onclick (http://127.0.0.1:9001/:8:184)")
      expect(result).to.deep.equal([
        {
          func: "at HTMLButtonElement.onclick",
          url: "http://127.0.0.1:9001/",
          line: "8",
          context: null,
          column: "184"
        }
      ])
