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
  environment: "environment",
  exception_class: "Error",
  exception_message: "number is not a function",
  key: "111",
  project_root: "file://localhost",
  request: {},
  request_action: "",
  request_component: "",
  request_url: ""
}

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
    it "has numeric `length`", ->
      formatter = new Formatter();
      result = formatter.format();
      expect(result.error.length).to.be.a("number")

    it "has `backtrace`", ->
      formatter = new Formatter();
      result = formatter.format();
      expect(result.error.backtrace).to.exist
