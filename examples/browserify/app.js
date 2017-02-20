function start() {
  var AirbrakeClient = require('airbrake-js'),
      instrumentJQuery = require('airbrake-js/dist/instrumentation/jquery.js');

  var airbrake = new AirbrakeClient({
    projectId: 1,
    projectKey: 'FIXME'
  });
  if (window.jQuery) {
    instrumentJQuery(airbrake, jQuery);
  }

  try {
    throw new Error('hello from Browserify');
  } catch (err) {
    promise = airbrake.notify(err);
    promise.then(function(notice) {
      console.log('notice id:', notice.id);
    }, function(err) {
      console.log('airbrake failed:', err);
    });
  }
}

start();
