var match_message_file_line_column = /\s+([^\(]+)\s+\((.*):(\d+):(\d+)\)/;

function recognizeFrame(string) {
  var func,
      file,
      line,
      column;

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

  return {
    file: file || "unsupported.js",
    line: parseInt(line || 0, 10),
    column: parseInt(column || 0, 10),
    "function": func
  };
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
  process: function(error) {
    error = error || {};
    var stack = (error.stack || "").split("\n");

    return processWithStack(error, stack);
  }
};

// Export processWithStack as class function
FallbackProcessor.processWithStack = processWithStack;

module.exports = FallbackProcessor;
