var merge = require("../util/merge");

function stacktraceObjFromString(string) {
  var function_name,
      file_name,
      line_number;

  return {
    'function': function_name,
    file: file_name,
    line: line_number
  };
}

function getStackTrace(error, splitFn) {
  var stacktrace_strings = splitFn ? splitFn(error) : [];
  var stacktrace = [];

  for(var i = stacktrace_strings.length - 1; i >= 0; i--) {
    stacktrace[i] = stacktraceObjFromString(stacktrace_strings[i]);
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
  process: function(error) {
  }
};

module.exports = BrowserProcessor;
