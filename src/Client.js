// The Client is the entry point to interacting with the Airbrake JS library.
// It stores configuration information and handles exceptions provided to it.
//
// It generates a Processor and a Reporter for each exception and uses them
// to transform an exception into data, and then to transport that data.
//
// window.Airbrake is an instance of Client
function Client(getProcessor, getReporter, setupjQueryTracker) {
  var instance = this;

  var _environment = "environment";
  instance.setEnvironment = function(val) { _environment = val; };
  instance.getEnvironment = function() { return _environment; };

  var _key;
  instance.setKey = function(val) { _key = val; };
  instance.getKey = function() { return _key; };

  var _project_id;
  instance.setProjectId = function(val) { _project_id = val; };
  instance.getProjectId = function() { return _project_id; };

  var _host = "api.airbrake.io";
  instance.setHost = function(val) { _host = val; };
  instance.getHost = function() { return _host; };

  var _error_defaults;
  instance.setErrorDefaults = function(val) { _error_defaults = val; };
  instance.getErrorDefaults = function() { return _error_defaults; };

  var _guessFunctionName = false;
  instance.setGuessFunctionName = function(val) { _guessFunctionName = val; };
  instance.getGuessFunctionName = function() { return _guessFunctionName; };

  var _outputFormat = "JSON";
  instance.setOutputFormat = function(val) { _outputFormat = val; };
  instance.getOutputFormat = function() { return _outputFormat; };

  // setTrackJQ can fire a callback
  var _trackJQ = false;
  instance.setTrackJQ = function(val) {
    // fire if the status toggled from false to true and the callback is defined
    if (!_trackJQ && val && setupjQueryTracker) {
      setupjQueryTracker();
    }
    _trackJQ = val;
  };
  instance.getTrackJQ = function() { return !!_trackJQ; };

  instance.captureException = function(exception) {
    // Get up-to-date Processor and Reporter for this exception
    var processor = getProcessor && getProcessor(instance),
        reporter = processor && getReporter(instance);

    if (processor && reporter) {
      // Transform the exception into a "standard" data format
      var data = processor.process(exception);
      // Transport data to receiver
      reporter.report(data);
    }
  };
}

module.exports = Client;
