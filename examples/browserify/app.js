function start() {
  var AirbrakeClient = require('airbrake-js');

  var airbrake = new AirbrakeClient({
    projectId: 1,
    projectKey: 'FIXME'
  });

  try {
    throw new Error('hello from Browserify');
  } catch (err) {
    airbrake.notify(err).then(function(notice) {
      if (notice.id) {
        console.log('notice id:', notice.id);
      } else {
        console.log('notify failed:', notice.error);
      }
    });
  }
}

start();
