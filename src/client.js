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

  var _project_id, _project_key;
  instance.setProject = function(id, key) {
    _project_id = id;
    _project_key = key;
  };
  instance.getProject = function() {
    return [_project_id, _project_key];
  };

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

  var _reporters = [];
  instance.getReporters = function() { return _reporters; };
  instance.addReporter = function(reporter) { _reporters.push(reporter); };

  var _filters = [];
  instance.addFilter = function(filter) { _filters.push(filter); };

  function createProcessorCb(notice) {
    var default_context = {
      language: 'JavaScript'
    };
    if (global.navigator && global.navigator.userAgent) {
      default_context.userAgent = global.navigator.userAgent;
    }
    if (global.location) {
      default_context.url = String(global.location);
    }

    return function(processorName, error) {
      var i, len;

      notice = {
        notifier: {
          name:    "Airbrake JS",
          version: "<%= pkg.version %>+" + processorName,
          url:     "https://github.com/airbrake/airbrake-js"
        },
        errors: [error],
        context: merge(default_context, _context, notice.context),
        environment: merge({}, _environment, notice.environment),
        params: merge({}, _params, notice.params),
        session: merge({}, _session, notice.session)
      };

      for (i = 0, len = _filters.length; i < len; i++) {
        var filter = _filters[i];
        if (!filter(notice)) {
          return;
        }
      }

      for (i = 0, len = _reporters.length; i < len; i++) {
        var reporter = _reporters[i];
        reporter(notice, {projectId: _project_id, projectKey: _project_key});
      }
    };
  }

  var _processor = getProcessor && getProcessor(createProcessorCb({}));
  if (getReporter) {
    instance.addReporter(getReporter());
  }

  function capture(notice) {
    _processor.process(notice.error || notice, createProcessorCb(notice));
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
        }
      };
    };
  }

  if (shim) {
    // Consume any errors already pushed to the shim.
    setTimeout(function() {
      for (var i = 0, len = shim.length; i < len; i++) {
        instance.push(shim[i]);
      }
    });
  }
}

module.exports = Client;
