if 'withCredentials' of new XMLHttpRequest()
  module.exports = require('./xhr.coffee')
else
  module.exports = require('./jsonp.coffee')
