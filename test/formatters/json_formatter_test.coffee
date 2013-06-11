expect = require("chai").expect
sinon = require("sinon")

Formatter = require("../../src/formatters/json_formatter")

describe "JSONFormatter", ->
  it "has `notifier`", ->
    formatter = new Formatter();
    result = formatter.format();
    expect(result.notifier).to.exist

  describe "notifier", ->
    it "has `name`", ->
      formatter = new Formatter();
      result = formatter.format();
      expect(result.notifier.name).to.exist

    it "has `version`", ->
      formatter = new Formatter();
      result = formatter.format();
      expect(result.notifier.version).to.exist

    it "has `url`", ->
      formatter = new Formatter();
      result = formatter.format();
      expect(result.notifier.url).to.exist

  it "has `error`", ->
    formatter = new Formatter();
    result = formatter.format();
    expect(result.error).to.exist

  describe "error", ->
    it "has `backtrace`", ->
      formatter = new Formatter();
      result = formatter.format();
      expect(result.error.backtrace).to.exist
