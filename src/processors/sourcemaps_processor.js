// A Sourcemaps-aware processor
// This processor runs the error through an underlying processor,
// then translates the output to file/line pairs as indicated by
// the sourcemaps it obtains
var SourceMapConsumer = require("../lib/source-map/source-map-consumer").SourceMapConsumer;

function obtainMany(backtrace_files, obtainer, source_maps, allObtained) {
  function obtainOne(url, obtainer) {
    obtainer.obtain(url, function(json) {
      var consumer;
      if (json) {
        consumer = new SourceMapConsumer(json);
        // As each sourcemaps json payload is obtained,
        // generate a sourcemap consumer from it, and cache it
        source_maps[url] = consumer;
      }
      if (!--remaining) { allObtained(source_maps); }
    });
  }

  var remaining = backtrace_files.length,
      i = remaining - 1;

  for (; i >= 0; i--) {
    obtainOne(backtrace_files[i], obtainer);
  }
}

function SourcemapsProcessor(preprocessor, obtainer) {
  this._source_maps = {};

  function preprocessorComplete(name, preprocessor_result, source_maps, fn) {
    // Process the error through the native error handler
    var preprocessor_backtrace = preprocessor_result.backtrace;

    // Collect the filenames of each file mentioned in the backtrace
    var backtrace_files = [], backtrace_file, cache = {};

    for (var i = preprocessor_backtrace.length - 1; i >= 0; i--) {
      backtrace_file = preprocessor_backtrace[i].file;
      // Use an object to track whether an item as already been added to
      // the list of backtrace files to avoid scanning the list for each
      // each file
      if (!cache[backtrace_file]) {
        cache[backtrace_file] = true;
        backtrace_files.push(backtrace_file);
      }
    }

    // There may be several sourcemaps to obtain. Once all are available,
    // the processed error can be further processed using the the sourcemaps
    function allObtained(source_maps) {
      var backtrace_entry, consumer, original_position;
      // Go line-by-line through the backtrace, substituting
      // SourceMapConsumer-supplied file names and positions
      // when available
      for (var i = preprocessor_backtrace.length - 1; i >= 0; i--) {
        backtrace_entry = preprocessor_backtrace[i];
        consumer = source_maps[backtrace_entry.file];

        if (consumer) {
          original_position = consumer.originalPositionFor({
            line: backtrace_entry.line,
            column: backtrace_entry.column
          });

          backtrace_entry.file = original_position.source;
          backtrace_entry.line = original_position.line;
          backtrace_entry.column = original_position.column;
        }
      }
      fn(name + '+sourcemaps', preprocessor_result);
    }

    // Begin obtaining the source maps
    obtainMany(backtrace_files, obtainer, source_maps, allObtained);
  }

  this.process = function(error, fn) {
    var source_maps = this._source_maps;

    preprocessor.process(error, function(name, result) {
      preprocessorComplete(name, result, source_maps, fn);
    });
  };
}

module.exports = SourcemapsProcessor;
