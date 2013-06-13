var TraceKit = require("../shims/TraceKit");

function TraceKitProcessor() {
  this.process = function(error) {
    var tracekit_result = TraceKit.computeStackTrace(error),
        stack = tracekit_result.stack;

    var backtrace = [], i, frame;
    for (i = stack.length - 1; i >= 0; i--) {
      frame = stack[i];
      backtrace.unshift({
        file: frame.url,
        line: frame.line,
        "function": frame.func
      });
    }

    return {
      type: tracekit_result.name,
      message: tracekit_result.message,
      backtrace: backtrace
    };
  };
}

module.exports = TraceKitProcessor;
