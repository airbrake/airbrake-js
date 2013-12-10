# Fixture generated using minimal browserify process
#   echo "module.exports={}" > src.js; ./node_modules/grunt-browserify/node_modules/browserify/bin/cmd.js -d src.js; rm src.js
chai       = require("chai")
sinon      = require("sinon")
sinon_chai = require("sinon-chai")
expect     = chai.expect
chai.use(sinon_chai)

expect = chai.expect
SourceMapProcessor = require("../../../src/processors/source_map")

source_map_json = "{\"version\":3,\"file\":\"generated.js\",\"sources\":[\"/Users/duncanbeevers/Projects/airbrake/airbrake-js/test/examples/js/browserify/main.js\",\"/Users/duncanbeevers/Projects/airbrake/airbrake-js/test/examples/js/browserify/error_coffee_maker_module.coffee\",\"/Users/duncanbeevers/Projects/airbrake/airbrake-js/test/examples/js/browserify/error_maker_module.js\"],\"names\":[],\"mappings\":\";AAAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;ACRA,CAAO,EAAU,GAAX,CAAN,EAAiB;CAAG,QAAC;CAAJ;;;;ACAjB;AACA;AACA;AACA\",\"sourcesContent\":[\"(function(global){// Generate bundle.js using browserify\\n//   ./node_modules/grunt-browserify/node_modules/browserify/bin/cmd.js -d test/examples/js/browserify/main.js -o test/examples/js/browserify/bundle.js\\nvar ErrorMaker = require(\\\"./error_maker_module\\\");\\nvar ErrorCoffeeMaker = require(\\\"./error_coffee_maker_module.coffee\\\");\\n\\nglobal.ErrorMaker = ErrorMaker;\\nglobal.ErrorCoffeeMaker = ErrorCoffeeMaker;\\n\\n})(window)\",\"module.exports = -> (0)()\\n\",\"module.exports = function ErrorMaker() {\\n  (0)();\\n};\\n\"]}"

describe "SourcemapsProcessor", ->
  describe "#process", ->

    it "obtains sourcemap by url", ->
      errInfo = {
        backtrace: [{
          function: "at module.exports"
          file: "min.js"
          line: 13
          column: 12
        }]
      }

      obtainer = { obtain: sinon.spy() }
      processor = new SourceMapProcessor('', errInfo, sinon.spy());
      processor._obtainer = obtainer

      processor.process()

      url = obtainer.obtain.lastCall.args[0]
      expect(url).to.equal("min.js")


    it "does not complete processing until source map is obtained", ->
      errInfo = {
        backtrace: [{
          function: "at module.exports"
          file: "min.js"
          line: 13
          column: 12
        }]
      }

      obtainer = { obtain: sinon.spy() }
      processor = new SourceMapProcessor('test', errInfo, null)
      processor._obtainer = obtainer

      processed = sinon.spy()
      processor._consumersReady = processed

      processor.process()

      # The obtainer should be called with a url, and a continuation
      # to invoke when a JSON payload is available.
      obtained = obtainer.obtain.lastCall.args[1]

      # Until the sourcemaps are available, the processor can't
      # hand off the payload
      expect(processed).not.to.have.been.called

      # Once we notify the processor that the sourcemap is available,
      # the processor can then merge that info into the error object.
      obtained(source_map_json)

      # The parent result object backtrace is modified in-place
      # by the sourcemaps processor, so it's okay to expect the same
      # object here.
      expect(processed).to.have.been.called
