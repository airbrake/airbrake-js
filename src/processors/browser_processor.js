var merge = require("../util/merge");

var match_message_file_line_column = /\s+([^\(]+)\s+\((.*):(\d+):(\d+)\)/;

function recognizeFrame(string) {
  var fn,
      file,
      line;

  var augmented_string = string;

  var match;

  match = string.match(match_message_file_line_column);
  if (match) {
    fn = match[1];
    file = match[2];
    line = match[3];
  }

  fn = fn || string;

  return {
    'function': fn,
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
      backtrace_lines: getStackTrace(error, splitFn)
    };

    return output_data;
  };
}

BrowserProcessor.prototype = {
  recognizeFrame: recognizeFrame
};

module.exports = BrowserProcessor;
