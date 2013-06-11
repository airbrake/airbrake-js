// The Browser reporter looks at the provided options and dispatches to
// the IFrame reporter, or to the XMLHttpRequest reporter
function BrowserReporter(formatter, options) {
  this.formatter = formatter;
}

BrowserReporter.prototype = {
  getReporter: function() {
    var transport;
    // If we can send via POST, do that
    if ("XML" === options.outputFormat) {
      transport = function() {

      };
    } else if ("JSON" === options.outputFormat) {
      transport = function() {

      };
    }
  },
  report: function(data) {
    this.getReporter().report(this.formatter.format(data));
  }
};

module.exports = BrowserReporter;
