function XhrReporter(processor_name) {
  return function(notice, options) {
    var url = "https://api.airbrake.io/api/v3/projects/" + options.projectId + "/notices?key=" + options.projectKey,
        request = new global.XMLHttpRequest();

    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(notice));
  };
}

module.exports = XhrReporter;
