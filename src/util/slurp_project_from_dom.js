module.exports = function(client) {
  var scripts = global.document.getElementsByTagName("script"),
      i = 0, len = scripts.length, script,
      project_id,
      project_key,
      project_environment_name;

  for (; i < len; i++) {
    script = scripts[i];
    project_id = script.getAttribute("data-airbrake-project-id");
    project_key = script.getAttribute("data-airbrake-project-key");
    project_environment_name = script.getAttribute("data-airbrake-project-environment-name");
    if (project_id && project_key) {
      client.setProject(project_id, project_key);
    }
    if (project_environment_name) {
      client.setEnvironmentName(project_environment_name);
    }
  }
};
