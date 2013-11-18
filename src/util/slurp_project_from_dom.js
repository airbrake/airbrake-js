function ga(script, attribute_name) {
  return script.getAttribute("data-airbrake-" + attribute_name);
}

module.exports = function(client) {
  var scripts = global.document.getElementsByTagName("script"),
      i = 0, len = scripts.length, script,
      project_id,
      project_key,
      project_env_name,
      onload;

  for (; i < len; i++) {
    script = scripts[i];

    project_id       = ga(script, "project-id");
    project_key      = ga("project-key");
    project_env_name = ga("project-environment-name");
    onload           = ga("onload");

    if (project_id && project_key) {
      client.setProject(project_id, project_key);
    }
    if (project_env_name) {
      client.setEnvironmentName(project_env_name);
    }
    if (onload) {
      global[onload]();
    }
  }
};
