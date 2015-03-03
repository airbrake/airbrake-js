if 'withCredentials' of new XMLHttpRequest()
  module.exports = require('./xhr')
else
  module.exports = require('./jsonp')
