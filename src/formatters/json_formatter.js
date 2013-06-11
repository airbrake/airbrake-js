var JSONFormatter = function() {};

JSONFormatter.prototype = {
  format: function(data) {
    var errors = [];
    errors.backtrace = [];

    return {
      context: {
        language: "JavaScript",
        url: data.request_url
      },
      notifier: {
        name: "airbrake_js",
        version: "<%= pkg.version %>",
        url: "http://airbrake.io"
      },
      error: errors
    };
  }
};

module.exports = JSONFormatter;
