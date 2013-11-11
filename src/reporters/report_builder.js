var merge = require("../util/merge");

// Responsible for creating a payload consumable by the Airbrake v3 API
function ReportBuilder() {}

ReportBuilder.build = function(environment_name, processor_name, error_data, options) {
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

  var context = {
    language    : "JavaScript",
    environment : environment_name
  };
  if (global.navigator && global.navigator.userAgent) {
    context.browser = global.navigator.userAgent;
  }
  if (global.location) {
    context.url = String(global.location);
  }

  context = merge(context, options.context);

  // Build the mandatory pieces of the output payload
  var output = {
    notifier : notifier_data,
    context  : context,
    errors   : [ error_data ]
  };

  // Add optional top-level keys to the output payload
  if (options.environment) { merge(output, { environment: options.environment }); }
  if (options.session) { merge(output, { session: options.session }); }
  if (options.params) { merge(output, { params: options.params }); }

  return output;
};

module.exports = ReportBuilder;
