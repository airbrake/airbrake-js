// The Client is the entry point to interacting with the Airbrake JS library.
// It stores configuration information and handles exceptions provided to it.
//
// It generates a Processor and a Reporter for each exception and uses them
// to transform an exception into data, and then to transport that data.
//
// window.Airbrake is an instance of Client

var merge = require("./util/merge");
var ReportBuilder = require("./reporters/report_builder");

function Client(getProcessor, getReporter, shim) {
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

  var _custom_reporters = [];
  instance.getReporters = function() { return _custom_reporters; };
  instance.addReporter = function(reporter) { _custom_reporters.push(reporter); };

  var _report_filters = [];
  instance.addFilter = function(filter) { _report_filters.push(filter); };

  // Defer a function call using setTimeout, forwards args
  // defer(function(arg) { console.log('arg: ' + arg); }, 10); // arg: 10
  function defer(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    setTimeout(function() {
      fn.apply(null, args);
    });
  }

  function capture(exception) {
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
    processor.process(exception_to_process, function(processor_name, data) {
      // Decorate data-to-be-reported with client data and
      // transport data to receiver
      var options = {
        context:     merge(default_context, _context, exception.context),
        environment: merge({}, _environment, exception.environment),
        params:      merge({}, _params, exception.params),
        session:     merge({}, _session, exception.session)
      };

      var report = ReportBuilder.build(processor_name, data, options);

      (function filter(remaining_filters) {
        if (remaining_filters.length) {
          remaining_filters[0](report, function(allow) {
            if (allow) {
              filter(remaining_filters.slice(1));
            }
          });
        } else {
          reporter.report(report);
        }
      }(_report_filters));

      for (var i = 0, len = _custom_reporters.length; i < len; i++) {
        defer(_custom_reporters[i], report);
      }
    });
  }

  instance.push = capture;

  if (global.Airbrake && global.Airbrake.wrap) {
    instance.wrap = global.Airbrake.wrap;
  } else {
    instance.wrap = function(fn) {
      return function() {
        try {
          return fn.apply(this, arguments);
        } catch (exc) {
          Airbrake.push({error: exc});
          throw exc;
        }
      };
    };
  }

  if (shim) {
    // Client is not yet configured, defer pushing extant errors.
    setTimeout(function() {
      // Attempt to consume any errors already pushed to the extant Airbrake object
      for (var i = 0, len = shim.length; i < len; i++) {
        instance.push(shim[i]);
      }
    });
  }
}

module.exports = Client;
