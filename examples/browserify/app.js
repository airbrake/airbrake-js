var AirbrakeClient = require('airbrake-js'),
    instrumentJQuery = require('airbrake-js/lib/instrumentation/jquery.js');

var airbrake = new AirbrakeClient({projectId: 1, projectKey: 'abc'});
if (window.jQuery) {
  instrumentJQuery(airbrake, jQuery);
}

try {
  throw new Error('hello from airbrake-js');
} catch (err) {
  promise = airbrake.notify(err);
  promise.then(function(notice) {
    console.log("notice id", notice.id);
  });
}
