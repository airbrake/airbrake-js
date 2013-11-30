function XhrReporter(project_id, project_key) {
  this.report = function(report) {
    var url     = "https://api.airbrake.io/api/v3/projects/" + project_id + "/notices?key=" + project_key,
        request = new global.XMLHttpRequest();

    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(report));
  };
}

module.exports = XhrReporter;
