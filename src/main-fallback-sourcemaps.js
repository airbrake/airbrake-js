var Client              = require("./client"),
    SourcemapsObtainer  = require("./util/sourcemaps_obtainer"),
    SourcemapsProcessor = require("./processors/sourcemaps_processor"),
    Processor           = require("./processors/fallback_processor"),
    Reporter            = require("./reporters/xhr_reporter");

var client;

function getProcessor(client) {
  var processor           = new Processor();
  var sourcemaps_obtainer = new SourcemapsObtainer();

  return new SourcemapsProcessor(processor, sourcemaps_obtainer);
}

function getReporter(client) {
  // TODO: Examine this, should we just default to ssl? What happens with spdy?
  var protocol = ("https:" === global.location.protocol ? "https://" : "http://");

  // Vars from client
  var host               = "api.airbrake.io",
      project_id_and_key = client.getProject(),
      project_id         = project_id_and_key[0],
      key                = project_id_and_key[1],
      environment_name   = client.getEnvironmentName();

  var url = protocol + host + "/api/v3/projects/" + project_id + "/notices?key=" + key;

  return new Reporter(url, environment_name, "fallback+sourcemaps");
}

client = new Client(getProcessor, getReporter);

global.Airbrake = global.Airbrake || client;
