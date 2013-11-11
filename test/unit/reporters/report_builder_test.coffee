expect = require("chai").expect

ReportBuilder = require("../../../src/reporters/report_builder")

describe "ReportBuilder", ->
  describe "build", ->
    result = null
    beforeEach ->
      result = ReportBuilder.build("[processor_name]")

    it "has `notifier`", ->
      expect(result.notifier).to.deep.equal(
        name: "Airbrake JS",
        version: "<%= pkg.version %>+[processor_name]",
        url: "http://airbrake.io"
      )

    it "merges custom context", ->
      result = ReportBuilder.build("", {}, { context: "CONTEXT_KEY": "CONTEXT_VAL" })
      expect(result.context.CONTEXT_KEY).to.equal("CONTEXT_VAL")

    it "has no `environment`", ->
      expect(result).not.to.have.property("environment")

    it "merges environment", ->
      result = ReportBuilder.build("", {}, { environment: "ENV_KEY": "ENV_VAL" })
      expect(result.environment).to.deep.equal("ENV_KEY": "ENV_VAL")

    it "has no `session`", ->
      expect(result).not.to.have.property("session")

    it "merges session", ->
      result = ReportBuilder.build("", {}, { session: "SESS_KEY": "SESS_VAL" })
      expect(result.session).to.deep.equal("SESS_KEY": "SESS_VAL")

    it "has no `params`", ->
      expect(result).not.to.have.property("params")

    it "merges params", ->
      result = ReportBuilder.build("", {}, { params: "PARAM_KEY": "PARAM_VAL" })
      expect(result.params).to.deep.equal("PARAM_KEY": "PARAM_VAL")

    it "has `errors`", ->
      result = ReportBuilder.build("", {type: "ERR_DATA_TYPE", message: "ERR_DATA_MESSAGE", backtrace: []})
      errors = result.errors
      expect(errors.length).to.equal(1)
      expect(errors[0]).to.deep.equal(
        type: "ERR_DATA_TYPE"
        message: "ERR_DATA_MESSAGE"
        backtrace: []
      )
