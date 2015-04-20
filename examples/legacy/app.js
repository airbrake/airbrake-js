var airbrake = new airbrakeJs.Client({projectId: 1, projectKey: 'abc'});
if (window.jQuery) {
  airbrakeJs.instrumentation.jquery(airbrake, jQuery);
}

try {
  throw new Error('hello from airbrake-js');
} catch (err) {
  airbrake.push(err);
}
