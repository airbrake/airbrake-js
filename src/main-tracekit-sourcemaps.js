var Client              = require("./client"),
    SourcemapsObtainer  = require("./util/sourcemaps_obtainer"),
    SourcemapsProcessor = require("./processors/sourcemaps_processor"),
    Processor           = require("./processors/tracekit_processor"),
    Reporter            = require("./reporters/api_v3_reporter");

var client, handler;

function getProcessor(client) {
  var processor           = new Processor();
  var sourcemaps_obtainer = new SourcemapsObtainer();

  return new SourcemapsProcessor(processor, sourcemaps_obtainer);
}

function getReporter(client) {
  // TODO: Examine this, should we just default to ssl? What happens with spdy?
  var protocol = ("https:" === global.location.protocol ? "https://" : "http://");

  // Vars from client
  var host        = "api.airbrake.io",
      project_id  = client.getProjectId(),
      key         = client.getKey(),
      environment_name   = client.getEnvironmentName();

  var url = protocol + host + "/api/v3/projects/" + project_id + "/notices?key=" + key;

  return new Reporter(url, environment_name, "fallback+sourcemaps");
}

client = new Client(getProcessor, getReporter);

global.Airbrake = global.Airbrake || client;
