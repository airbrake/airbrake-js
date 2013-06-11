var JSONFormatter = function(data) {
  this.data = data;
};

JSONFormatter.prototype = {
  format: function() {
    return {
      notifier: {
        name: "airbrake_js",
        version: "<%= pkg.version %>",
        url: "http://airbrake.io"
      }
    };
  }
};

module.exports = JSONFormatter;
