var Client              = require("./client"),
    SourcemapsObtainer  = require("./util/sourcemaps_obtainer"),
    SourcemapsProcessor = require("./processors/sourcemaps_processor"),
    Processor           = require("./processors/tracekit_processor"),
    NewReporter         = require("./reporters/hybrid_reporter");

var client;

function getProcessor() {
  return new SourcemapsProcessor(new Processor(), new SourcemapsObtainer());
}

function getReporter() {
  return NewReporter("fallback+sourcemaps");
}

client = new Client(getProcessor, getReporter, global.Airbrake);
global.Airbrake = client;

// Read project id and key from DOM
require("./util/slurp_project_from_dom")(client);
