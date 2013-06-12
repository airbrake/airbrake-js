var Client = require("../client"),
    BrowserProcessor = require("../processors/browser_processor"),
    BrowserReporter = require("../reporters/browser_reporter");

// This error-to-array-of-strings implementation can be swapped out
var printStackTrace = require("stacktrace-js");

function getProcessor(client) {
  var key = client.getKey(),
      environment = client.getEnvironment(),
      guess_function_name = client.getGuessFunctionName(),
      error_defaults = client.getErrorDefaults();

  function splitErrorBacktrace(error) {
    var options = {
      e: error,
      guess: guess_function_name
    };
    return printStackTrace(options);
}

  return new BrowserProcessor(key, environment, splitErrorBacktrace, error_defaults);
}

function getReporter(client) {
  return new BrowserReporter();
}

var client = new Client(getProcessor, getReporter);

// global.Airbrake = global.Hoptoad = new Client(processor, reporter);
global.NewAirbrake = client;
global.Airbrake = client;
