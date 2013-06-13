var Client = require("../client"),
    Processor = require("../processors/browser_processor"),

// This error-to-array-of-strings implementation can be swapped out
var printStackTrace = require("stacktrace-js");
    Reporter  = require("../reporters/api_v3_reporter");

function getProcessor(client) {
  // Vars from global
  var document_location_hash = global.document.location.hash,
      navigator_user_agent   = global.navigator.userAgent,
      app_root               = global.location.protocol + '//' + global.location.host;

  // Vars from client
  var key                 = client.getKey(),
      environment         = client.getEnvironment(),
      guess_function_name = client.getGuessFunctionName(),
      error_defaults      = client.getErrorDefaults();

  function splitErrorBacktrace(error) {
    var options = {
      e: error,
      guess: guess_function_name
    };
    return printStackTrace(options);
  }

  return new Processor(splitErrorBacktrace, key, environment, error_defaults, document_location_hash, navigator_user_agent, app_root);
}

function getReporter(client) {
  // TODO: Examine this, should we just default to ssl? What happens with spdy?
  var protocol = ("https:" === global.location.protocol ? "https://" : "http://");

  // Vars from client
  var host       = client.getHost(),
      project_id = client.getProjectId(),
      key        = client.getKey();

  var url = protocol + host + "/api/v3/projects/" + project_id + "/notices?key=" + key;

  return new Reporter(url);
}

var client = new Client(getProcessor, getReporter);

global.NewAirbrake = client;
global.Airbrake = global.Airbrake || client;
global.Hoptoad = global.Airbrake;
