// The Client is the entry point to interacting with the Airbrake JS library.
// It stores configuration information and handles exceptions provided to it.
//
// It generates a Processor and a Reporter for each exception and uses them
// to transform an exception into data, and then to transport that data.
//
// window.Airbrake is an instance of Client

var merge = require("./util/merge");

function Client(getProcessor, getReporter, extant_errors) {
  var instance = this;

  var _project_id, _key;
  instance.setProject = function(project_id, key) {
    _project_id = project_id;
    _key = key;
  };
  instance.getProject = function() { return [ _project_id, _key ]; };

  var _context = {};
  instance.getContext = function() { return _context; };
  instance.addContext = function(context) { merge(_context, context); };

  instance.setEnvironmentName = function(val) { _context.environment = val; };
  instance.getEnvironmentName = function() {
    if (_context.environment) {
      return _context.environment;
    }
    return '';
  };

  var _environment = {};
  instance.getEnvironment = function() { return _environment; };
  instance.addEnvironment = function(environment) { merge(_environment, environment); };

  var _params = {};
  instance.getParams = function() { return _params; };
  instance.addParams = function(params) { merge(_params, params); };

  var _session = {};
  instance.getSession = function() { return _session; };
  instance.addSession = function(session) { merge(_session, session); };

  function capture(exception) {
    try {
      // Get up-to-date Processor and Reporter for this exception
      var processor = getProcessor && getProcessor(instance),
          reporter = processor && getReporter(instance);

      var default_context = {
        language: "JavaScript"
      };
      if (global.navigator && global.navigator.userAgent) {
        default_context.userAgent = global.navigator.userAgent;
      }
      if (global.location) {
        default_context.url = String(global.location);
      }

      var exception_to_process = exception.error || exception;

      // Transform the exception into a "standard" data format
      processor.process(exception_to_process, function(data) {
        // Decorate data-to-be-reported with client data and
        // transport data to receiver
        var options = {
          context:     merge(default_context, _context, exception.context),
          environment: merge({}, _environment, exception.environment),
          params:      merge({}, _params, exception.params),
          session:     merge({}, _session, exception.session)
        };
        reporter.report(data, options);
      });
    } catch(_) {
      // Well, this is embarassing
      // TODO: log exception
    }
  }

  instance.capture = capture;
  instance.push = capture;

  instance.try = function(fn, as) {
    try {
      return fn.call(as);
    } catch(er) {
      instance.capture(er);
    }
  };
  instance.wrap = function(fn, as) {
    return function() {
      return instance.try(fn, as);
    };
  };

  // Client is not yet configured, defer pushing extant errors.
  setTimeout(function() {
    // Attempt to consume any errors already pushed to the extant Airbrake object
    if (extant_errors) {
      for (var i = 0, len = extant_errors.length; i < len; i++) {
        instance.push(extant_errors[i]);
      }
    }
  });
}

module.exports = Client;
