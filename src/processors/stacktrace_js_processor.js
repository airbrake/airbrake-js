/* jshint -W087 */
var printStackTrace = require("stacktrace-js");
var FallbackProcessor = require("./fallback_processor");

function StacktraceJsProcessor() {}

StacktraceJsProcessor.prototype = {
  process: function(error) {
    var stack = printStackTrace(error);
    return FallbackProcessor.processWithStack(error, stack);
  }
};

module.exports = StacktraceJsProcessor;
