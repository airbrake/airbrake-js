function start() {
  var Airbrake = require('@airbrake/browser');

  var airbrake = new Airbrake.Notifier({
    projectId: 1,
    projectKey: 'FIXME',
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
