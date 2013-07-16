var ReportBuilder = require("../reporters/report_builder");
var toQueryString = require("../util/to_query_string");

var has_question_mark_matcher = /\?/;

function JsonpReporter(url, environment_name, processor_name, custom_context_data, custom_environment_data, custom_session_data, custom_params_data) {
  this.report = function(error_data) {
    var output_data = ReportBuilder.build(environment_name, processor_name, custom_context_data, custom_environment_data, custom_session_data, custom_params_data, error_data),
        document = global.document,
        head = document.getElementsByTagName("head")[0],
        script_tag = document.createElement("script"),
        script_src = url + (url.match(has_question_mark_matcher) ? "&" : "?") + toQueryString(output_data);

    script_tag.src = script_src;
    script_tag.type = "text/javascript";
    script_tag.onLoad = function() { head.removeChild(script_tag); };

    head.appendChild(script_tag);
  };
}

module.exports = JsonpReporter;
