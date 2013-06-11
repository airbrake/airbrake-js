expect = require("chai").expect
sinon = require("sinon")

Formatter = require("../../src/formatters/json_formatter")

describe "JSONFormatter", ->
  describe "notifier", ->
    it "has name", ->
      formatter = new Formatter();
      result = formatter.format();
      expect(result.notifier.name).to.exist

    it "has version", ->
      formatter = new Formatter();
      result = formatter.format();
      expect(result.notifier.version).to.exist

    it "has url", ->
      formatter = new Formatter();
      result = formatter.format();
      expect(result.notifier.url).to.exist
