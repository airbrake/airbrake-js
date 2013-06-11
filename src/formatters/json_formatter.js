var JSONFormatter = function() {};

JSONFormatter.prototype = {
  format: function() {
    var errors = [];
    errors.backtrace = [];

    return {
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
