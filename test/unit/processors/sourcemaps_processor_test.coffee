# Fixture generated using minimal browserify process
#   echo "module.exports={}" > src.js; ./node_modules/grunt-browserify/node_modules/browserify/bin/cmd.js -d src.js; rm src.js
expect = require("chai").expect
Processor = require("../../../src/processors/sourcemaps_processor")

source_map_json = "{\"version\":3,\"file\":\"generated.js\",\"sources\":[\"/Users/duncanbeevers/Projects/airbrake/airbrake-js/test/examples/js/browserify/main.js\",\"/Users/duncanbeevers/Projects/airbrake/airbrake-js/test/examples/js/browserify/error_coffee_maker_module.coffee\",\"/Users/duncanbeevers/Projects/airbrake/airbrake-js/test/examples/js/browserify/error_maker_module.js\"],\"names\":[],\"mappings\":\";AAAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;ACRA,CAAO,EAAU,GAAX,CAAN,EAAiB;CAAG,QAAC;CAAJ;;;;ACAjB;AACA;AACA;AACA\",\"sourcesContent\":[\"(function(global){// Generate bundle.js using browserify\\n//   ./node_modules/grunt-browserify/node_modules/browserify/bin/cmd.js -d test/examples/js/browserify/main.js -o test/examples/js/browserify/bundle.js\\nvar ErrorMaker = require(\\\"./error_maker_module\\\");\\nvar ErrorCoffeeMaker = require(\\\"./error_coffee_maker_module.coffee\\\");\\n\\nglobal.ErrorMaker = ErrorMaker;\\nglobal.ErrorCoffeeMaker = ErrorCoffeeMaker;\\n\\n})(window)\",\"module.exports = -> (0)()\\n\",\"module.exports = function ErrorMaker() {\\n  (0)();\\n};\\n\"]}"

describe "SourcemapsProcessor", ->
  describe "#process", ->
    it "should process through parent processor", ->
      backtrace = [
        { file: 'min.js', line: 13, column: 12, function: 'at module.exports' }
      ]

      parent_processor = { process: (error) -> { backtrace: backtrace } }

      source_maps_by_url = { 'min.js': source_map_json }
      processor = new Processor(parent_processor, source_maps_by_url);

      result = processor.process()

      backtrace_entry = result.backtrace[0]
      console.dir(backtrace_entry)
      expect(backtrace_entry.file).to.equal('/Users/duncanbeevers/Projects/airbrake/airbrake-js/test/examples/js/browserify/error_coffee_maker_module.coffee')
      expect(backtrace_entry.line).to.equal(1)
