expect = require("chai").expect
sinon = require("sinon")

Processor = require("../../src/processors/browser_processor")

error = {
  message: "number is not a function",
  stack: "TypeError: number is not a function
     at null.<anonymous> (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/spec/basicSpecs.js:56:16)
     at jasmine.Block.execute (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:1024:15)
     at jasmine.Queue.next_ (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2025:31)
     at jasmine.Queue.start (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:1978:8)
     at jasmine.Spec.execute (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2305:14)
     at jasmine.Queue.next_ (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2025:31)
     at jasmine.Queue.start (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:1978:8)
     at jasmine.Suite.execute (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2450:14)
     at jasmine.Queue.next_ (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2025:31)
     at onComplete (file://localhost/Users/duncanbeevers/Projects/airbrake/airbrake-js/tests/lib/jasmine-1.2.0/jasmine.js:2021:18)"
}

describe "BrowserProcessor", ->
  client = {
    getKey: -> "[key]"
    getEnvironment: -> "[environment]"
  }

  it "has `key` provided by client", ->
    result = new Processor(client).process(error)
    expect(result.key).to.equal("[key]")

  it "has `environment` provided by client", ->
    result = new Processor(client).process(error)
    expect(result.environment).to.equal("[environment]")
