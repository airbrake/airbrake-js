var JSONFormatter = function() {};

JSONFormatter.prototype = {
  format: function(data) {
    var errors = [];
    errors.backtrace = [];

    return {
      context: {
        language: "JavaScript",
        url: data.request_url,
        environment: data.environment,
        rootDirectory: data.project_root,
        action: data.request_action
      },
      notifier: {
        name: "airbrake_js",
        version: "<%= pkg.version %>",
        url: "http://airbrake.io"
      },
      environment: {},
      params: {},
      error: errors
    };
  }
};

module.exports = JSONFormatter;
