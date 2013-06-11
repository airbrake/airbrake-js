var Client = require("../client"),
    BrowserProcessor = require("../processors/browser_processor"),
    BrowserReporter = require("../reporters/browser_reporter");

var processor = new BrowserProcessor(),
    reporter = new BrowserReporter();

global.Airbrake = global.Hoptoad = new Client(processor, reporter);
