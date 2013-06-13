var merge = require("../util/merge");

function addErrorDataToRequest(error_key, error, request_data) {
  var error_val = error[error_key],
      collection, key;

  if (error_val) {
    collection = request_data[error_key] || (request_data[error_key] = []);

    for (key in error_val) {
      collection.push({
        key: key,
        value: error_val[key]
      });
    }
  }
}

// BrowserProcessor must be initialized with a number
// of parameters in order to capture data dependencies
//
//   `stackFn` is a function that returns an array of
//     strings representing frames of a JavaScript backtrace,
//     used as an injection point for stacktrace-js#printStackTrace
//
//   `key`, `environment`, and `error_defaults` come
//     from Client configuration options, (eg Airbrake.setErrorDefaults())
//
//  `document_location_hash` comes from
//    document.location.hash as a fallback for the error url
//
//  `navigator_user_agent` comes from
//    window.navigator.userAgent for populating request HTTP_USER_AGENT
function BrowserProcessor(stackFn, key, environment, error_defaults, document_location_hash, navigator_user_agent, app_root) {
  this.process = function(error_without_defaults) {

    var error = merge(error_without_defaults, error_defaults);

    var backtrace_lines = stackFn ? stackFn(error) : [],
        error_url       = error.url       || "" + (document_location_hash || ""),
        error_component = error.component || "",
        error_action    = error.action    || "",
        error_type      = error.type      || "Error",
        error_message   = error.message   || "Unknown error.",
        request_data    = {},
        tmp_obj;

    if (error_url || error_component) {
      // Always add cgi-data, and prepopulate user agent
      request_data['cgi-data'] = [{ key: 'HTTP_USER_AGENT', value: navigator_user_agent }];

      // Copy key and environment to request data
      request_data.key = key;
      request_data.environment = environment;

      // Map object properties from error onto request data
      addErrorDataToRequest('cgi-data', error, request_data);
      addErrorDataToRequest('params', error, request_data);
      addErrorDataToRequest('session', error, request_data);
    }

    var output_data = {
      key: key,
      environment: environment,
      backtrace_lines: backtrace_lines,
      request: request_data,
      request_action: error_action,
      request_component: error_component,
      request_url: error_url,
      exception_class: error_type,
      exception_message: error_message,
      project_root: app_root
    };

    return output_data;
  };
}

module.exports = BrowserProcessor;
