// A Sourcemaps-aware processor
// This processor runs the error through an underlying processor,
// then translates the output to file/line pairs as indicated by
// the supplied source maps

// var SourceMap = require("../lib/source-map");
var SourceMap = require("source-map");

function SourcemapsProcessor(preprocessor, source_maps_by_url) {
  this.process = function(error) {
    var preprocessor_result = preprocessor.process(error),
        preprocessor_backtrace = preprocessor_result.backtrace,
        backtrace_entry, backtrace_file,
        json, consumer, result;

    for (var i = preprocessor_backtrace.length - 1; i >= 0; i--) {
      backtrace_entry = preprocessor_backtrace[i];
      backtrace_file = backtrace_entry.file;
      json = source_maps_by_url[backtrace_file];

      if (json) {
        consumer = new SourceMap.SourceMapConsumer(json);
        result = consumer.originalPositionFor({
          line: backtrace_entry.line,
          column: backtrace_entry.column
        });

        // Modify backtrace entry in-place, replacing file, line, and column
        backtrace_entry.file = result.source;
        backtrace_entry.line = result.line;
        backtrace_entry.column = result.column;
      }
    }

    return preprocessor_result;
  };
}

module.exports = SourcemapsProcessor;
