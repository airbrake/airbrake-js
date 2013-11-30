var Client = require("./client"),
    Processor = require("./processors/tracekit_processor"),
    Reporter  = require("./reporters/hybrid_reporter");

var client;

function getProcessor(client) {
  return new Processor();
}

function getReporter(client) {
  // Vars from client
  var project_id_and_key = client.getProject(),
      project_id         = project_id_and_key[0],
      project_key        = project_id_and_key[1];

  return new Reporter(project_id, project_key);
}

client = new Client(getProcessor, getReporter, global.Airbrake);
global.Airbrake = client;

// Read project id and key from DOM
require("./util/slurp_project_from_dom")(client);
