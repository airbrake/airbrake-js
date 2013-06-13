var TraceKit = require("../lib/TraceKit");
TraceKit.remoteFetching = false;
TraceKit.collectWindowErrors = false;

function TraceKitProcessor() {
  this.process = function(error) {
    var tracekit_result = TraceKit.computeStackTrace(error),
        stack = tracekit_result.stack;

    var backtrace = [], i, frame;
    for (i = stack.length - 1; i >= 0; i--) {
      frame = stack[i];
      backtrace.unshift({
        file: frame.url,
        line: parseInt(frame.line, 10),
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
