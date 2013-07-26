module.exports = function(client) {
  var scripts = global.document.getElementsByTagName("script"),
      i = 0, len = scripts.length, script,
      project_id,
      project_key;

  for (; i < len; i++) {
    script = scripts[i];
    project_id = script.getAttribute("data-airbrake-project-id");
    project_key = script.getAttribute("data-airbrake-project-key");
    if (project_id && project_key) {
      client.setProject(project_id, project_key);
      break;
    }
  }
};
