var ReportBuilder = require("../reporters/report_builder");

function XhrReporter(project_id, project_key, processor_name) {
  this.report = function(error_data, options) {
    var output_data = ReportBuilder.build(processor_name, error_data, options),
        url         = "https://api.airbrake.io/api/v3/projects/" + project_id + "/notices?key=" + project_key,
        request     = new global.XMLHttpRequest();

    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(output_data));
  };
}

module.exports = XhrReporter;
