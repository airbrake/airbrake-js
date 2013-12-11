var TraceKit = require("../shims/tracekit_browserify_shim");
TraceKit.remoteFetching = false;
TraceKit.collectWindowErrors = true;

function TraceKitProcessor(defaultCb) {
  var _calls = [];

  TraceKit.report.subscribe(function(errorInfo, cb) {
    var lastCall = _calls.pop();
    if (lastCall === undefined) {
      cb = defaultCb;
    } else if (cb === undefined) {
      // Errors from onerror handler have undefined callback.
      cb = lastCall.cb;
    } else if (cb !== lastCall.cb) {
      _calls.push(lastCall);
      cb = defaultCb;
    }

    var stack = errorInfo.stack;
    var backtrace = [], i, frame;
    for (i = 0; i < stack.length; i++) {
      frame = stack[i];
      backtrace.push({
        "function": frame.func === '?' ? '' : frame.func,
        file: frame.url,
        line: parseInt(frame.line, 10),
        column: parseInt(frame.column, 10)
      });
    }

    cb('tracekit', {
      type: errorInfo.name || '',
      message: errorInfo.message || String(lastCall.error),
      backtrace: backtrace
    });
  });

  this.process = function(error, cb) {
    _calls.push({error: error, cb: cb});
    TraceKit.report(error, cb);
  };
}

module.exports = TraceKitProcessor;
