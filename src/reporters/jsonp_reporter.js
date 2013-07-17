var ReportBuilder = require("../reporters/report_builder");

function JsonpReporter(project_id, project_key, environment_name, processor_name, custom_context_data, custom_environment_data, custom_session_data, custom_params_data) {
  this.report = function(error_data) {
    var output_data = ReportBuilder.build(environment_name, processor_name, custom_context_data, custom_environment_data, custom_session_data, custom_params_data, error_data),
        document    = global.document,
        head        = document.getElementsByTagName("head")[0],
        script_tag  = document.createElement("script"),
        body        = JSON.stringify(output_data),
        url         = "https://api.airbrake.io/api/v3/projects/" + project_id + "/create-notice?key=" + project_key + "&body=" + encodeURIComponent(body);

    function removeTag() { head.removeChild(script_tag); }

    script_tag.src     = url;
    script_tag.type    = "text/javascript";
    script_tag.onload  = removeTag;
    script_tag.onerror = removeTag;

    head.appendChild(script_tag);
  };
}

module.exports = JsonpReporter;
