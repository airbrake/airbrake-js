var Client      = require("./client"),
    Processor   = require("./processors/tracekit_processor"),
    NewReporter = require("./reporters/hybrid_reporter");

var client;

function getProcessor(defaultCb) {
  return new Processor(defaultCb);
}

function getReporter() {
  return NewReporter("tracekit");
}

client = new Client(getProcessor, getReporter, global.Airbrake);
global.Airbrake = client;

// Read project id and key from DOM
require("./util/slurp_project_from_dom")(client);
