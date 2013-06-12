var merge = require("../util/merge");

var backtrace_matcher = /^(.*)\@(.*)\:(\d+)$/;

function recognizeFrame(string) {
  var fn,
      file,
      line;

  if (~string.indexOf("@")) {
    file = "unsupported.js";
  } else {

  }

  return { 'function': fn, file: file, line: line };
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
