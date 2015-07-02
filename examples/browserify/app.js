var AirbrakeClient = require('airbrake-js'),
    instrumentJquery = require('airbrake-js/lib/instrumentation/jquery.js');

var airbrake = new AirbrakeClient({projectId: 1, projectKey: 'abc'});
if (window.jQuery) {
  instrumentJQuery(airbrake, jQuery);
}

try {
  throw new Error('hello from airbrake-js');
} catch (err) {
  airbrake.push(err);
}
