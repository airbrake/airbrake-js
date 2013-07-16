var ReportBuilder = require("../reporters/report_builder");

function XhrReporter(url, environment_name, processor_name, custom_context_data, custom_environment_data, custom_session_data, custom_params_data) {
  this.report = function(error_data) {
    var output_data = ReportBuilder.build(environment_name, processor_name, custom_context_data, custom_environment_data, custom_session_data, custom_params_data, error_data);

    var request = new global.XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(output_data));
  };
}

module.exports = XhrReporter;
