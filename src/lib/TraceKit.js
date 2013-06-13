// browserify shim for TraceKit bower module
// Expose TraceKit to global namespace
require("../../bower/traceKit");

// Capture reference and remove from global namespace
module.exports = global.TraceKit.noConflict();
