expect = require("chai").expect

ReportBuilder = require("../../../src/reporters/report_builder")

describe "ReportBuilder", ->
  describe "build", ->
    result = null
    beforeEach ->
      result = ReportBuilder.build("[environment_name]", "[processor_name]")

    it "has `notifier`", ->
      expect(result.notifier).to.deep.equal(
        name: "Airbrake JS",
        version: "<%= pkg.version %>+[processor_name]",
        url: "http://airbrake.io"
      )

    it "has `context`", ->
      expect(result.context).to.deep.equal(
        language: "JavaScript",
        environment: "[environment_name]"
      )

    it "merges custom context", ->
      result = ReportBuilder.build(null, null, "CONTEXT_KEY": "CONTEXT_VAL")
      expect(result.context.CONTEXT_KEY).to.equal("CONTEXT_VAL")

    it "has no `environment`", ->
      expect(result).not.to.have.property("environment")

    it "merges custom environment", ->
      result = ReportBuilder.build(null, null, null, "ENV_KEY": "ENV_VAL", null, null, {})
      expect(result.errors[0].environment).to.deep.equal("ENV_KEY": "ENV_VAL")

    it "has no `session`", ->
      expect(result).not.to.have.property("session")

    it "merges custom session", ->
      result = ReportBuilder.build(null, null, null, null, "SESS_KEY": "SESS_VAL", null, {})
      expect(result.errors[0].session).to.deep.equal("SESS_KEY": "SESS_VAL")

    it "has no `params`", ->
      expect(result).not.to.have.property("params")

    it "merges custom params", ->
      result = ReportBuilder.build(null, null, null, null, null, "PARAM_KEY": "PARAM_VAL", {})
      expect(result.errors[0].params).to.deep.equal("PARAM_KEY": "PARAM_VAL")

    it "has `errors`", ->
      result = ReportBuilder.build(null, null, null, null, null, null, type: "ERR_DATA_TYPE", message: "ERR_DATA_MESSAGE", backtrace: [])
      errors = result.errors
      expect(errors.length).to.equal(1)
      expect(errors[0]).to.deep.equal(
        type: "ERR_DATA_TYPE"
        message: "ERR_DATA_MESSAGE"
        backtrace: []
      )
