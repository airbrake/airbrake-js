var TraceKit = require("../shims/tracekit_browserify_shim");
TraceKit.remoteFetching = true;
TraceKit.collectWindowErrors = false;

TraceKit.report.subscribe(function(tracekit_result, fn) {
  var stack = tracekit_result.stack;

  var backtrace = [], i, frame;
  for (i = stack.length - 1; i >= 0; i--) {
    frame = stack[i];
    backtrace.unshift({
      file: frame.url,
      line: parseInt(frame.line, 10),
      column: parseInt(frame.column, 10),
      "function": frame.func
    });
  }

  fn({
    type: tracekit_result.name,
    message: tracekit_result.message,
    backtrace: backtrace
  });

});

function TraceKitProcessor() {
  this.process = function(error, fn) {
    TraceKit.report(error, fn);
  };
}

module.exports = TraceKitProcessor;
