expect = require("chai").expect

Reporter = require("../../src/reporters/xhr_reporter")

describe "XHRReporter", ->
  describe "report", ->
    it "opens async POST to url", ->
      reporter = new Reporter("[url]").report({})
