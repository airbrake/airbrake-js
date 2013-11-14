;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
(function(global){var Client = require("./client"),
    Processor = require("./processors/fallback_processor"),
    Reporter  = require("./reporters/jsonp_reporter");

var client;

function getProcessor(client) {
  return new Processor();
}

function getReporter(client) {
  // Vars from client
  var project_id_and_key = client.getProject(),
      project_id         = project_id_and_key[0],
      project_key        = project_id_and_key[1];

  return new Reporter(project_id, project_key, "fallback");
}

client = new Client(getProcessor, getReporter, global.Airbrake);
global.Airbrake = client;

// Read project id and key from DOM
require("./util/slurp_project_from_dom")(client);

})(window)
},{"./client":2,"./processors/fallback_processor":4,"./reporters/jsonp_reporter":3,"./util/slurp_project_from_dom":5}],4:[function(require,module,exports){
(function(){var match_message_file_line_column = /\s+([^\(]+)\s+\((.*):(\d+):(\d+)\)/;

function recognizeFrame(string) {
  var func,
      file,
      line,
      column,
      result;

  var match;

  match = string.match(match_message_file_line_column);
  if (match) {
    func   = match[1];
    file   = match[2];
    line   = match[3];
    column = match[4];
  }

  // Function falls back to entire string if
  // the function name can't be extracted
  func = func || string;

  result = {
    file: file || "unsupported.js",
    line: parseInt(line || 0, 10),
    column: parseInt(column || 0, 10),
    "function": func
  };

  return result;
}

// Extract the error type name
// from the first line of a stack trace array
function errorType(error, stack) {
  var first_line = stack[0],
      match = first_line.match(/\s*([^:]+)/);

  if (match) {
    return match[1];
  } else {
    return "Error";
  }
}

function processWithStack(error, stack) {
  var backtrace = [], i,
      error_message = error.message;

  for (i = stack.length - 1; i >= 0; i--) {
    backtrace[i] = recognizeFrame(stack[i]);
  }

  return {
    type: errorType(error, stack),
    message: error_message,
    backtrace: backtrace
  };
}

function FallbackProcessor() {}

FallbackProcessor.prototype = {
  processWithStack: processWithStack,
  process: function(error, fn) {
    error = error || {};
    var stack = (error.stack || "").split("\n");

    fn(processWithStack(error, stack));
  }
};

// Export processWithStack as class function
FallbackProcessor.processWithStack = processWithStack;

module.exports = FallbackProcessor;

})()
},{}],5:[function(require,module,exports){
(function(global){module.exports = function(client) {
  var scripts = global.document.getElementsByTagName("script"),
      i = 0, len = scripts.length, script,
      project_id,
      project_key,
      project_environment_name;

  for (; i < len; i++) {
    script = scripts[i];
    project_id = script.getAttribute("data-airbrake-project-id");
    project_key = script.getAttribute("data-airbrake-project-key");
    project_environment_name = script.getAttribute("data-airbrake-project-environment-name");
    if (project_id && project_key) {
      client.setProject(project_id, project_key);
    }
    if (project_environment_name) {
      client.setEnvironmentName(project_environment_name);
    }
  }
};

})(window)
},{}],2:[function(require,module,exports){
(function(global){// The Client is the entry point to interacting with the Airbrake JS library.
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

})(window)
},{"./util/merge":6}],3:[function(require,module,exports){
(function(global){var ReportBuilder = require("../reporters/report_builder");

var cb_count = 0;

function JsonpReporter(project_id, project_key, processor_name) {
  this.report = function(error_data, options) {
    var output_data = ReportBuilder.build(processor_name, error_data, options),
        document    = global.document,
        head        = document.getElementsByTagName("head")[0],
        script_tag  = document.createElement("script"),
        body        = JSON.stringify(output_data),
        cb_name     = "airbrake_cb_" + cb_count,
        prefix      = "https://api.airbrake.io",
        url         = prefix + "/api/v3/projects/" + project_id + "/create-notice?key=" + project_key + "&callback=" + cb_name + "&body=" + encodeURIComponent(body);


    // Attach an anonymous function to the global namespace to consume the callback.
    // This pevents syntax errors from trying to directly execute the JSON response.
    global[cb_name] = function() { delete global[cb_name]; };
    cb_count += 1;

    function removeTag() { head.removeChild(script_tag); }

    script_tag.src     = url;
    script_tag.type    = "text/javascript";
    script_tag.onload  = removeTag;
    script_tag.onerror = removeTag;

    head.appendChild(script_tag);
  };
}

module.exports = JsonpReporter;

})(window)
},{"../reporters/report_builder":7}],6:[function(require,module,exports){
/* jshint -W084 */
/*
 * Merge a number of objects into one.
 *
 * Usage example:
 *  var obj1 = {
 *      a: 'a'
 *    },
 *    obj2 = {
 *      b: 'b'
 *    },
 *    obj3 = {
 *      c: 'c'
 *    },
 *    mergedObj = Util.merge(obj1, obj2, obj3);
 *
 * mergedObj is: {
 *   a: 'a',
 *   b: 'b',
 *   c: 'c'
 * }
 *
 */
var merge = (function() {
  function processProperty (key, dest, src) {
    if (src.hasOwnProperty(key)) {
      dest[key] = src[key];
    }
  }

  return function() {
    var objects = Array.prototype.slice.call(arguments),
      obj,
      key,
      result = objects.shift() || {},
      i, l = objects.length;

    for (i = 0; i < l; i++) {
      obj = objects[i];
      if (obj) {
        for (key in obj) {
          processProperty(key, result, obj);
        }
      }
    }

    return result;
  };
}());

module.exports = merge;

},{}],7:[function(require,module,exports){
var merge = require("../util/merge");

// Responsible for creating a payload consumable by the Airbrake v3 API
function ReportBuilder() {}

ReportBuilder.build = function(processor_name, error_data, options) {
  // `error_data` should be of the format
  //   { type: String,
  //     message: String,
  //     backtrace: Array
  //   }
  //
  // Each member of `error_data.backtrace` should be of the format
  //   { file: String,
  //     line: Number,
  //     function: String
  //   }

  if (!options) {
    options = {};
  }

  var notifier_data = {
    name    : "Airbrake JS",
    version : "0.2.2+" + processor_name,
    url     : "http://airbrake.io"
  };

  // Build the mandatory pieces of the output payload
  var output = {
    notifier : notifier_data,
    errors   : [ error_data ]
  };

  // Add optional top-level keys to the output payload
  if (options.context) { merge(output, { context: options.context }); }
  if (options.environment) { merge(output, { environment: options.environment }); }
  if (options.session) { merge(output, { session: options.session }); }
  if (options.params) { merge(output, { params: options.params }); }

  return output;
};

module.exports = ReportBuilder;

},{"../util/merge":6}]},{},[1])
;