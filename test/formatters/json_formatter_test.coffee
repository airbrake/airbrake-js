expect = require("chai").expect
sinon = require("sinon")

Formatter = require("../../src/formatters/json_formatter")

outputData = {
  backtrace_lines: [
    { file: "unsupported.js", line: "0", function: "TypeError: number is not a function" },
    { file: "unsupported.js", line: "0", function: "    at null.<anonymous> (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/spec/basicSpecs.js:56:16)" },
    { file: "unsupported.js", line: "0", function: "    at jasmine.Block.execute (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:1024:15)" },
    { file: "unsupported.js", line: "0", function: "    at jasmine.Queue.next_ (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2025:31)" },
    { file: "unsupported.js", line: "0", function: "    at jasmine.Queue.start (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:1978:8)" },
    { file: "unsupported.js", line: "0", function: "    at jasmine.Spec.execute (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2305:14)" },
    { file: "unsupported.js", line: "0", function: "    at jasmine.Queue.next_ (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2025:31)" },
    { file: "unsupported.js", line: "0", function: "    at jasmine.Queue.start (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:1978:8)" },
    { file: "unsupported.js", line: "0", function: "    at jasmine.Suite.execute (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2450:14)" },
    { file: "unsupported.js", line: "0", function: "    at jasmine.Queue.next_ (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2025:31)" },
    { file: "unsupported.js", line: "0", function: "    at onComplete (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2021:18)" },
  ],
  environment: "[environment]",
  exception_class: "Error",
  exception_message: "number is not a function",
  key: "111",
  project_root: "file://localhost",
  request: {},
  request_action: "[request_action]",
  request_component: "",
  request_url: "[request_url]"
}

describe "JSONFormatter", ->
  it "has `notifier`", ->
    result = new Formatter().format(outputData)
    expect(result.notifier).to.exist

  describe "notifier", ->
    it "has `name`", ->
      result = new Formatter().format(outputData)
      expect(result.notifier.name).to.exist

    it "has `version`", ->
      result = new Formatter().format(outputData)
      expect(result.notifier.version).to.exist

    it "has `url`", ->
      result = new Formatter().format(outputData)
      expect(result.notifier.url).to.exist

  it "has `error`", ->
    result = new Formatter().format(outputData)
    expect(result.error).to.exist

  describe "error", ->
    it "has numeric `length`", ->
      result = new Formatter().format(outputData)
      expect(result.error.length).to.be.a("number")

    it "has `backtrace`", ->
      result = new Formatter().format(outputData);
      expect(result.error.backtrace).to.exist

  it "has `context`", ->
    result = new Formatter().format(outputData);
    expect(result.context).to.exist

  describe "context", ->
    it "has `language` JavaScript", ->
      result = new Formatter().format(outputData)
      expect(result.context.language).to.equal("JavaScript")

    it "has `url` from data.request_url", ->
      result = new Formatter().format(outputData)
      expect(result.context.url).to.equal("[request_url]")

    it "has `environment` from data.environment", ->
      result = new Formatter().format(outputData)
      expect(result.context.environment).to.equal("[environment]")

    it "has `rootDirectory` from data.project_root", ->
      result = new Formatter().format(outputData)
      expect(result.context.rootDirectory).to.equal("file://localhost")

    it "has `action` from data.request_action", ->
      result = new Formatter().format(outputData)
      expect(result.context.action).to.equal("[request_action]")

    # it "has `userId`", ->
    #   result = new Formatter().format(outputData)
    #   expect(result.context.userId).to.exist

    # it "has `userName`", ->
    #   result = new Formatter().format(outputData)
    #   expect(result.context.userName).to.exist

    # it "has `userEmail`", ->
    #   result = new Formatter().format(outputData)
    #   expect(result.context.userEmail).to.exist

  it "has `environment`", ->
    result = new Formatter().format(outputData);
    expect(result.environment).to.be.an("object")

