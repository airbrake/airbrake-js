// The Client is the entry point to interacting with the Airbrake JS library.
// It stores configuration information and handles exceptions provided to it.
//
// It generates a Processor and a Reporter for each exception and uses them
// to transform an exception into data, and then to transport that data.
//
// window.Airbrake is an instance of Client

var merge = require("./util/merge");

function Client(getProcessor, getReporter) {
  var instance = this;

  var _environment = "environment";
  instance.setEnvironment = function(val) { _environment = val; };
  instance.getEnvironment = function() { return _environment; };

  var _project_id, _key;
  instance.setProject = function(project_id, key) {
    _project_id = project_id;
    _key = key;
  };
  instance.getProject = function() { return [ _project_id, _key ]; };

  var _context = {};
  instance.getContext = function() { return _context; };
  instance.addContext = function(context) {
    merge(_context, context);
  };

  instance.captureException = function(exception) {
    try {
      // Get up-to-date Processor and Reporter for this exception
      var processor = getProcessor && getProcessor(instance),
          reporter = processor && getReporter(instance);

      if (processor && reporter) {
        // Transform the exception into a "standard" data format
        processor.process(exception, function(data) {
          // Transport data to receiver
          reporter.report(data);
        });
      }
    } catch(_) {
      // Well, this is embarassing
    }
  };
}

module.exports = Client;
