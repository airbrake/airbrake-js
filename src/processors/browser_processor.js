var merge = require("../util/merge");

var match_message_file_line_column = /\s+([^\(]+)\s+\((.*):(\d+):(\d+)\)/;

function recognizeFrame(string) {
  var message,
      file,
      line;

  var match;

  match = string.match(match_message_file_line_column);
  if (match) {
    message = match[1];
    file = match[2];
    line = match[3];
  }

  // Function falls back to entire string if
  // the function name can't be extracted
  message = message || string;

  return {
    'function': message,
    file: file || "unsupported.js",
    line: line || "0"
  };
}

function getStackTrace(error, splitFn) {
  var stacktrace_strings = splitFn ? splitFn(error) : [];
  var frame, stacktrace = [];

  for(var i = stacktrace_strings.length - 1; i >= 0; i--) {
    frame = recognizeFrame(stacktrace_strings[i]);
    if (frame) { stacktrace.unshift(frame); }
  }

  return stacktrace;
}

// BrowserProcessor must be initialized with a number
// of parameters in order to capture data dependencies
//
//   `splitFn` is a function that returns an array of
//     strings representing frames of a JavaScript backtrace,
//     used as an injection point for stacktrace-js#printStackTrace
//
//   `key`, `environment`, and `error_defaults` come
//     from Client configuration options, (eg Airbrake.setErrorDefaults())
//
//  `document_location_hash` comes from
//    document.location.hash as a fallback for the error url
//
function BrowserProcessor(splitFn, key, environment, error_defaults, document_location_hash) {
  this.process = function(error_without_defaults) {

    var error = merge(error_without_defaults, error_defaults);

    var error_url = error.url || "" + (document_location_hash || ""),
        error_component = error.component || "",
        error_action = error.action || "";

    var output_data = {
      key: key,
      environment: environment,
      backtrace_lines: getStackTrace(error, splitFn),
      request: {},
      request_action: error_action,
      request_component: error_component,
      request_url: error_url
    };

    return output_data;
  };
}

BrowserProcessor.prototype = {
  recognizeFrame: recognizeFrame
};

module.exports = BrowserProcessor;
