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

function BrowserProcessor(key, environment, splitFn) {
  this.process = function(error) {
    var output_data = {
      key: key,
      environment: environment,
      backtrace_lines: getStackTrace(error, splitFn),
      request: {},
      request_action: '',
      request_component: '',
      request_url: error.url
    };

    return output_data;
  };
}

BrowserProcessor.prototype = {
  recognizeFrame: recognizeFrame
};

module.exports = BrowserProcessor;
