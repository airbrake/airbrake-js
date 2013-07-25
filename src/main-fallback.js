var Client = require("./client"),
    Processor = require("./processors/fallback_processor"),
    Reporter  = require("./reporters/jsonp_reporter");

var client;

function getProcessor(client) {
  return new Processor();
}

function getReporter(client) {
  // Vars from client
  var project_id_and_key = client.getProject(),
      project_id         = project_id_and_key[0],
      project_key        = project_id_and_key[1],
      environment_name   = client.getEnvironmentName();

  return new Reporter(project_id, project_key, environment_name, "fallback");
}

client = new Client(getProcessor, getReporter, global.Airbrake);
global.Airbrake = client;
