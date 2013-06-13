var Client = require("./client"),
    // Processor = require("./processors/tracekit_processor"),
    Processor = require("./processors/fallback_processor"),
    Reporter  = require("./reporters/api_v3_reporter");

function getProcessor(client) {
  return new Processor();
}

function getReporter(client) {
  // TODO: Examine this, should we just default to ssl? What happens with spdy?
  var protocol = ("https:" === global.location.protocol ? "https://" : "http://");

  // Vars from client
  var host        = client.getHost(),
      project_id  = client.getProjectId(),
      key         = client.getKey(),
      environment = client.getEnvironment();

  var url = protocol + host + "/api/v3/projects/" + project_id + "/notices?key=" + key;

  return new Reporter(url, environment);
}

var client = new Client(getProcessor, getReporter);

// require("../legacy-notifier");

global.NewAirbrake = client;
global.Airbrake = global.Airbrake || client;
global.Hoptoad = global.Airbrake;
