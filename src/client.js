// The Client is the entry point to interacting with the Airbrake JS library.
// It stores configuration information and handles exceptions provided to it.
//
// It generates a Processor and a Reporter for each exception and uses them
// to transform an exception into data, and then to transport that data.
//
// window.Airbrake is an instance of Client

var merge = require("./util/merge");

function Client(getProcessor, getReporter, shim) {
  var instance = this;

  var _environment_name = "environment";
  instance.setEnvironmentName = function(val) { _environment_name = val; };
  instance.getEnvironmentName = function() { return _environment_name; };

  var _project_id, _key;
  instance.setProject = function(project_id, key) {
    _project_id = project_id;
    _key = key;
  };
  instance.getProject = function() { return [ _project_id, _key ]; };

  var _context = {};
  instance.getContext = function() { return _context; };
  instance.addContext = function(context) { merge(_context, context); };

  var _env = {};
  instance.getEnv = function() { return _env; };
  instance.addEnv = function(env) { merge(_env, env); };

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

      var exception_to_process = exception.error   || exception,
          capture_context      = exception.context || {},
          capture_env          = exception.env     || {},
          capture_params       = exception.params  || {},
          capture_session      = exception.session || {};

      if (processor && reporter) {
        // Transform the exception into a "standard" data format
        processor.process(exception_to_process, function(data) {
          // Decorate data-to-be-reported with client data
          merge(data, {
            context : merge({}, capture_context, _context),
            env     : merge({}, capture_env, _env),
            params  : merge({}, capture_params, _params),
            session : merge({}, capture_session, _session)
          });

          // Transport data to receiver
          reporter.report(data);
        });
      }
    } catch(_) {
      // Well, this is embarassing
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
    if (shim) {
      for (var i = 0, len = shim.length; i < len; i++) {
        instance.push(shim[i]);
      }
    }
  });
}

module.exports = Client;
