attr = (script, attrName) ->
  return script.getAttribute("data-airbrake-#{attrName}")


module.exports = (client) ->
  scripts = global.document.getElementsByTagName('script')

  for script in scripts
    projectId = attr(script, 'project-id')
    projectKey = attr(script, 'project-key')
    if projectId and projectKey
      client.setProject(projectId, projectKey)

    envName = attr(script, 'environment-name')
    if envName
      client.setEnvironmentName(envName)

    host = attr(script, 'host')
    if host
      client.setHost(host)

    onload = attr(script, 'onload')
    if onload
      global[onload](client)
