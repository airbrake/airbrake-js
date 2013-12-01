var TraceKit = require("../shims/tracekit_browserify_shim");
TraceKit.remoteFetching = true;
TraceKit.collectWindowErrors = true;

function TraceKitProcessor(fn) {
  var _fns = [];

  TraceKit.report.subscribe(function(error, fn) {
    var last_fn = _fns.pop();
    if (!fn) {
      fn = last_fn;
    } else if (fn != last_fn) {
      console.log("airbrake: precondition failed: fn != last_fn");
      return;
    }

    var stack = error.stack;
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

    fn('tracekit', {
      type: error.name,
      message: error.message,
      backtrace: backtrace
    });
  });

  this.process = function(error, fn) {
    _fns.push(fn);
    TraceKit.report(error, fn);
  };
}

module.exports = TraceKitProcessor;
