function ga(script, attr) {
  return script.getAttribute("data-airbrake-" + attr);
}

module.exports = function(client) {
  var scripts = global.document.getElementsByTagName("script"),
      i = 0, len = scripts.length, script,
      project_id,
      project_key,
      env_name,
      onload;

  for (; i < len; i++) {
    script = scripts[i];

    project_id       = ga(script, "project-id");
    project_key      = ga(script, "project-key");
    env_name = ga(script, "environment-name");
    onload           = ga(script, "onload");

    if (project_id && project_key) {
      client.setProject(project_id, project_key);
    }
    if (env_name) {
      client.setEnvironmentName(env_name);
    }
    if (onload) {
      global[onload]();
    }
  }
};
