var Client = require("./client"),
    Processor = require("./processors/<%= processor_name %>"),
    Reporter  = require("./reporters/api_v3_reporter"),
    JQWrapperToggler = require("./jquery_event_handler_wrapper");

var client, handler, toggler;

toggler = new JQWrapperToggler(function(error) { client.captureException(error); });

function getProcessor(client) {
  return new Processor();
}

function getReporter(client) {
  // TODO: Examine this, should we just default to ssl? What happens with spdy?
  var protocol = ("https:" === global.location.protocol ? "https://" : "http://");

  // Vars from client
  var host        = client.getHost(),
      project_id  = client.getProjectId(),
      key         = client.getKey(),
      environment = client.getEnvironment();

  var url = protocol + host + "/api/v3/projects/" + project_id + "/notices?key=" + key;

  return new Reporter(url, environment, "<%= processor_name %>");
}

client = new Client(getProcessor, getReporter, toggler.on, toggler.off);

global.Airbrake = global.Airbrake || client;
global.Hoptoad = global.Airbrake;
