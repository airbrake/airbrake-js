var merge = require("../util/merge");

// Responsible for creating a payload consumable by the Airbrake v3 API
function ReportBuilder() {}

ReportBuilder.build = function(processor_name, error_data, options) {
  // `error_data` should be of the format
  //   { type: String,
  //     message: String,
  //     backtrace: Array
  //   }
  //
  // Each member of `error_data.backtrace` should be of the format
  //   { file: String,
  //     line: Number,
  //     function: String
  //   }

  if (!options) {
    options = {};
  }

  var notifier_data = {
    name    : "Airbrake JS",
    version : "<%= pkg.version %>+" + processor_name,
    url     : "http://airbrake.io"
  };

  // Build the mandatory pieces of the output payload
  var output = {
    notifier : notifier_data,
    errors   : [ error_data ]
  };

  // Add optional top-level keys to the output payload
  if (options.context) { merge(output, { context: options.context }); }
  if (options.environment) { merge(output, { environment: options.environment }); }
  if (options.session) { merge(output, { session: options.session }); }
  if (options.params) { merge(output, { params: options.params }); }

  return output;
};

module.exports = ReportBuilder;
