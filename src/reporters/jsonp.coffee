jsonify = require('../util/jsonify.coffee')


cbCount = 0

report = (notice, opts) ->
  cbCount++

  cbName = "airbrakeCb" + String(cbCount)
  global[cbName] = ->
    delete global[cbName]

  payload = encodeURIComponent(jsonify(notice))
  url = "https://api.airbrake.io/api/v3/projects/#{opts.projectId}/create-notice?key=#{opts.projectKey}&callback=#{cbName}&body=#{payload}"

  document = global.document
  head = document.getElementsByTagName('head')[0]
  script = document.createElement('script')
  script.src = url
  removeScript -> head.removeChild(script)
  script.onload = removeTag
  script.onerror = removeTag

  head.appendChild(script_tag);


module.exports = report
