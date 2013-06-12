var JSONFormatter = require("../formatters/json_formatter"),
    formatter = new JSONFormatter();

function XHRReporter(url) {
  this.report = function(data) {
    var formatted = formatter.format(data);

    var request = new global.XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(formatted));
  };
}

module.exports = XHRReporter;
