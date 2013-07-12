var Client              = require("./client"),
    SourcemapsObtainer  = require("./util/sourcemaps_obtainer"),
    SourcemapsProcessor = require("./processors/sourcemaps_processor"),
    Processor           = require("./processors/tracekit_processor"),
    Reporter            = require("./reporters/api_v3_reporter"),
    JQWrapperToggler    = require("./jquery_event_handler_wrapper");

var client, handler, toggler;
toggler = new JQWrapperToggler(function(error) { client.captureException(error); });

function getProcessor(client) {
  var processor  = new Processor();
  var sourcemaps_obtainer = new SourcemapsObtainer();

  return new SourcemapsProcessor(processor, sourcemaps_obtainer);
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

  return new Reporter(url, environment, "fallback+sourcemaps");
}

client = new Client(getProcessor, getReporter, toggler.on, toggler.off);

// require("./legacy-notifier");

global.NewAirbrake = client;
global.Airbrake = global.Airbrake || client;
global.Hoptoad = global.Airbrake;

// Hook into the window onerror handler
require("./util/window_onerror");
