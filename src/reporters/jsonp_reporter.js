var ReportBuilder = require("../reporters/report_builder");

var cb_count = 0;

function JsonpReporter(project_id, project_key, environment_name, processor_name) {
  this.report = function(error_data, options) {
    var output_data = ReportBuilder.build(environment_name, processor_name, error_data, options),
        document    = global.document,
        head        = document.getElementsByTagName("head")[0],
        script_tag  = document.createElement("script"),
        body        = JSON.stringify(output_data),
        cb_name     = "airbrake_cb_" + cb_count,
        prefix      = "https://api.airbrake.io",
        url         = prefix + "/api/v3/projects/" + project_id + "/create-notice?key=" + project_key + "&callback=" + cb_name + "&body=" + encodeURIComponent(body);


    // Attach an anonymous function to the global namespace to consume the callback.
    // This pevents syntax errors from trying to directly execute the JSON response.
    global[cb_name] = function() { delete global[cb_name]; };
    cb_count += 1;

    function removeTag() { head.removeChild(script_tag); }

    script_tag.src     = url;
    script_tag.type    = "text/javascript";
    script_tag.onload  = removeTag;
    script_tag.onerror = removeTag;

    head.appendChild(script_tag);
  };
}

module.exports = JsonpReporter;
