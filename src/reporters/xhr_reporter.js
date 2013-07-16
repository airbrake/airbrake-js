var merge = require("../util/merge");

function XhrReporter(url, environment_name, processor_name, custom_context_data, custom_environment_data, custom_session_data, custom_params_data) {

  // Responsible for creating a payload consumable by the Airbrake v3 API
  function generateOutputData(error_data) {
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

    var notifier_data = {
      name    : "Airbrake JS",
      version : "<%= pkg.version %>+" + processor_name,
      url     : "http://airbrake.io"
    };

    var context_data = merge(custom_context_data, {
      language    : "JavaScript",
      environment : environment_name
    });

    // Build the mandatory pieces of the output payload
    var output_data = {
      notifier : notifier_data,
      context  : context_data,
      errors   : [ error_data ]
    };

    // Add optional top-level keys to the output payload
    if (custom_environment_data) { merge(output_data, { environment: custom_environment_data }); }
    if (custom_session_data) { merge(output_data, { session: custom_session_data }); }
    if (custom_params_data) { merge(output_data, { params: custom_params_data }); }

    return output_data;
  }

  this.report = function(error_data) {
    var output_data = generateOutputData(error_data);

    var request = new global.XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(output_data));
  };

  this.generateOutputData = generateOutputData;
}

module.exports = XhrReporter;
