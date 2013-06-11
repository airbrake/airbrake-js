// The Client is the entry point to interacting with the Airbrake JS library.
// It stores configuration information and dispatches errors.
// window.Airbrake is an instance of Client.
function Client(processor, reporter, setupjQueryTracker) {
  var instance = this;

  var _environment;
  instance.setEnvironment = function(val) { _environment = val; };
  instance.getEnvironment = function() { return _environment; };

  var _key;
  instance.setKey = function(val) { _key = val; };
  instance.getKey = function() { return _key; };

  var _host;
  instance.setHost = function(val) { _host = val; };
  instance.getHost = function() { return _host; };

  var _errorDefaults;
  instance.setErrorDefaults = function(val) { _errorDefaults = val; };
  instance.getErrorDefaults = function() { return _errorDefaults; };

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
    if (processor && reporter) {
      var data = processor.process(exception);
      reporter.report(data);
    }
  };
}

module.exports = Client;
