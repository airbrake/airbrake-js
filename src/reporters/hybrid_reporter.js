var Reporter;

if ('withCredentials' in new XMLHttpRequest()) {
  Reporter = require('./xhr_reporter');
} else {
  Reporter = require('./jsonp_reporter');
}

module.exports = Reporter;
