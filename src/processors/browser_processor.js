var merge = require("../util/merge");

function BrowserProcessor(client) {
  this.process = function() {

    var outputData = {
      key: client.getKey(),
      environment: client.getEnvironment()
    };

    return outputData;
  };
}

BrowserProcessor.prototype = {
  process: function(error) {
  }
};

module.exports = BrowserProcessor;
